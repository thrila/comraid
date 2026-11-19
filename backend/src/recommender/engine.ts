import type { Category, EventType, InteractionEvent, Product, Recommendation } from "../types";
import { buildContentSimilarity } from "./content";
import {
  EVENT_WEIGHTS,
  buildCollaborativeModel,
  decay,
  type CollaborativeModel,
} from "./collaborative";

/** How many shoppers an item needs before behaviour outweighs attributes. */
const COLLAB_SUPPORT_HALF = 10;
/** Content similarity always keeps at least this share of the blend. */
const MAX_COLLAB_SHARE = 0.7;
/** Each extra pick from the same category is multiplied by this, to keep lists varied. */
const CATEGORY_DIVERSITY_PENALTY = 0.85;
/** Regional engagement (in weighted events) at which a region's taste counts as much as global. */
const REGION_EVIDENCE_HALF = 25;
/** Distinct items a shopper must touch before their own history counts as much as regional taste. */
const PERSONAL_HISTORY_HALF = 3;
/** Recency half-lives, in days. `session` is ~1 hour: what the shopper is doing right now. */
const HALF_LIFE = { trending: 7, profile: 14, session: 1 / 24 };
/** How much more a just-now interaction counts than an equally strong older one. */
const SESSION_BOOST = 3;
/** Under heavy traffic the collaborative model is rebuilt at most this often (ms). */
const COLLAB_REBUILD_INTERVAL = 5_000;

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
export function regionName(code: string) {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

interface Scored {
  index: number;
  score: number;
  reason: string;
}

export interface TrendingOptions {
  category?: Category;
  region?: string;
  exclude?: Set<number>;
}

/**
 * Hybrid recommender:
 *  - item similarity = TF-IDF content similarity blended with item-item collaborative
 *    filtering, leaning on behaviour for well-known items and attributes for new ones;
 *  - popularity is regional, shrunk towards global popularity where a region has little data;
 *  - the "For You" feed blends regional popularity with the shopper's own history, shifting
 *    towards their history as it grows (the usual cold-start treatment), and weights the
 *    current session heavily so it reacts to what the shopper is doing right now.
 * Everything is live: each recorded event or catalogue change is reflected on the next query.
 */
export class Recommender {
  private products: Product[] = [];
  private indexOf = new Map<string, number>();
  private content: Float64Array = new Float64Array(0);
  private readonly events: InteractionEvent[];
  private readonly userRegion = new Map<string, string>();
  private collab: CollaborativeModel | null = null;
  private collabBuiltAt = 0;
  private collabStale = false;

  constructor(products: Product[], events: InteractionEvent[] = []) {
    this.events = [];
    this.setProducts(products);
    for (const e of events) this.record(e);
  }

  get eventCount() {
    return this.events.length;
  }

  /** Call whenever the catalogue changes; events for deleted products are simply ignored. */
  setProducts(products: Product[]) {
    this.products = products;
    this.indexOf = new Map(products.map((p, i) => [p.id, i]));
    this.content = buildContentSimilarity(products);
    this.collab = null;
  }

  hasProduct(id: string) {
    return this.indexOf.has(id);
  }

  record(event: InteractionEvent) {
    this.events.push(event);
    if (event.region) this.userRegion.set(event.userId, event.region);
    // Popularity and profiles read the event log directly, so they are live immediately;
    // the collaborative model catches up on the next query (throttled under load).
    this.collabStale = true;
  }

  /** Products that look like / are bought alongside `productId`. */
  similar(productId: string, limit = 8): Recommendation[] {
    const i = this.indexOf.get(productId);
    if (i === undefined) return [];
    const { sim, support } = this.model();
    const alpha = this.collabShare(support[i]);
    const n = this.products.length;

    const scored: Scored[] = [];
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const collabPart = alpha * sim[i * n + j];
      const contentPart = (1 - alpha) * this.content[i * n + j];
      const score = collabPart + contentPart;
      if (score <= 0) continue;
      scored.push({
        index: j,
        score,
        reason: collabPart > contentPart ? "Shoppers who liked this also liked" : "Similar style",
      });
    }
    return this.finalize(scored, limit, new Set([i]));
  }

  /** Complements for everything currently in the basket. */
  forBasket(productIds: string[], limit = 8, region?: string): Recommendation[] {
    const basket = this.indices(productIds);
    const exclude = new Set(basket);
    if (basket.length === 0) return this.trending(limit, { region });
    const scored = this.profileScores(
      new Map(basket.map((i) => [i, 1])),
      exclude,
      (anchor) => `Goes well with ${this.products[anchor].name}`,
    );
    return this.finalize(scored, limit, exclude, region);
  }

  /**
   * Personalised "For You" feed. New shoppers get what's popular in their region; as their
   * history grows the feed shifts towards items related to what they viewed, carted and bought.
   */
  forUser(
    userId: string,
    limit = 8,
    { exclude: excludeIds = [], region }: { exclude?: string[]; region?: string } = {},
  ): Recommendation[] {
    const now = Date.now();
    const weights = new Map<number, number>();
    const strongest = new Map<number, EventType>();

    for (const e of this.events) {
      if (e.userId !== userId) continue;
      const i = this.indexOf.get(e.productId);
      if (i === undefined) continue;
      // Long-term taste plus a short-lived boost for in-session intent, so the feed
      // reacts to the current browsing session and then relaxes back.
      const recency =
        decay(e.timestamp, now, HALF_LIFE.profile) +
        SESSION_BOOST * decay(e.timestamp, now, HALF_LIFE.session);
      const w = EVENT_WEIGHTS[e.type] * recency;
      weights.set(i, (weights.get(i) ?? 0) + w);
      const prev = strongest.get(i);
      if (!prev || EVENT_WEIGHTS[e.type] > EVENT_WEIGHTS[prev]) strongest.set(i, e.type);
    }

    region ??= this.userRegion.get(userId);
    const purchased = [...strongest].filter(([, type]) => type === "purchase").map(([i]) => i);
    const exclude = new Set([...purchased, ...this.indices(excludeIds)]);
    if (weights.size === 0) return this.trending(limit, { region, exclude });

    const personal = this.profileScores(weights, exclude, (anchor) => {
      const name = this.products[anchor].name;
      switch (strongest.get(anchor)) {
        case "purchase":
          return `Because you bought ${name}`;
        case "cart":
          return `Because you added ${name} to cart`;
        default:
          return `Because you viewed ${name}`;
      }
    });

    // Blend: trust personal history more as it grows, regional popularity less.
    const beta = weights.size / (weights.size + PERSONAL_HISTORY_HALF);
    const popular = this.popularity(region);
    const maxPersonal = Math.max(...personal.map((s) => s.score), 1e-9);
    const personalByIndex = new Map(personal.map((s) => [s.index, s]));

    const blended: Scored[] = [];
    for (let j = 0; j < this.products.length; j++) {
      if (exclude.has(j)) continue;
      const p = personalByIndex.get(j);
      const personalPart = beta * ((p?.score ?? 0) / maxPersonal);
      const popularPart = (1 - beta) * popular.scores[j];
      let score = personalPart + popularPart;
      // Items the shopper already engaged with are still shown, but lower.
      if (weights.has(j)) score *= 0.5;
      blended.push({
        index: j,
        score,
        reason: p && personalPart >= popularPart ? p.reason : popular.reason(j),
      });
    }
    return this.finalize(blended, limit, exclude, region);
  }

  /** Most engaged-with products recently, regional where data allows. */
  trending(limit = 8, { category, region, exclude = new Set() }: TrendingOptions = {}) {
    const popular = this.popularity(region);
    const scored: Scored[] = [];
    this.products.forEach((p, i) => {
      if (category && p.category !== category) return;
      scored.push({ index: i, score: popular.scores[i], reason: popular.reason(i) });
    });
    return this.finalize(scored, limit, exclude, region, false);
  }

  /**
   * Point-in-time snapshot of the learned model: each product's nearest neighbours (hybrid,
   * collaborative and content scores), global and per-region popularity, plus the settings
   * used. Portable JSON for backups, auditing, or serving from another system.
   */
  exportSnapshot(neighbours = 20) {
    const { sim, support } = this.model();
    const n = this.products.length;
    const round = (x: number) => Math.round(x * 10000) / 10000;
    const regions = [...new Set(this.events.map((e) => e.region).filter((r): r is string => !!r))].sort();
    const popularityOf = (region?: string) => {
      const { scores } = this.popularity(region);
      return Object.fromEntries(this.products.map((p, i) => [p.id, round(scores[i])]));
    };

    return {
      format: "shop-recommender-snapshot",
      version: 1,
      createdAt: new Date().toISOString(),
      settings: {
        eventWeights: EVENT_WEIGHTS,
        halfLifeDays: HALF_LIFE,
        sessionBoost: SESSION_BOOST,
        collabSupportHalf: COLLAB_SUPPORT_HALF,
        maxCollabShare: MAX_COLLAB_SHARE,
        regionEvidenceHalf: REGION_EVIDENCE_HALF,
        personalHistoryHalf: PERSONAL_HISTORY_HALF,
      },
      stats: { products: n, events: this.events.length, shoppers: new Set(this.events.map((e) => e.userId)).size },
      products: this.products.map((p, i) => {
        const alpha = this.collabShare(support[i]);
        const scored = [];
        for (let j = 0; j < n; j++) {
          if (j === i) continue;
          const collab = sim[i * n + j];
          const content = this.content[i * n + j];
          const score = alpha * collab + (1 - alpha) * content;
          if (score > 0) scored.push({ id: this.products[j].id, score: round(score), collab: round(collab), content: round(content) });
        }
        scored.sort((a, b) => b.score - a.score);
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          shoppers: support[i],
          collabShare: round(alpha),
          neighbours: scored.slice(0, neighbours),
        };
      }),
      popularity: {
        global: popularityOf(),
        byRegion: Object.fromEntries(regions.map((r) => [r, popularityOf(r)])),
      },
    };
  }

  /** Aggregate counts for the admin dashboard. */
  stats() {
    const byRegion = new Map<string, number>();
    const byProduct = new Map<string, number>();
    for (const e of this.events) {
      const region = e.region ?? "unknown";
      byRegion.set(region, (byRegion.get(region) ?? 0) + 1);
      if (this.indexOf.has(e.productId)) {
        byProduct.set(e.productId, (byProduct.get(e.productId) ?? 0) + EVENT_WEIGHTS[e.type]);
      }
    }
    return {
      events: this.events.length,
      shoppers: new Set(this.events.map((e) => e.userId)).size,
      regions: [...byRegion]
        .map(([code, events]) => ({ code, name: code === "unknown" ? "Unknown" : regionName(code), events }))
        .sort((a, b) => b.events - a.events),
      topProducts: [...byProduct]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, score]) => ({ product: this.products[this.indexOf.get(id)!], score: Math.round(score) })),
    };
  }

  /**
   * Popularity normalised to [0, 1]. With a region, regional popularity is shrunk towards
   * global popularity in proportion to how much regional evidence exists.
   */
  private popularity(region?: string) {
    const now = Date.now();
    const n = this.products.length;
    const global = new Float64Array(n);
    const local = new Float64Array(n);
    let regionalEvidence = 0;

    for (const e of this.events) {
      const i = this.indexOf.get(e.productId);
      if (i === undefined) continue;
      const w = EVENT_WEIGHTS[e.type] * decay(e.timestamp, now, HALF_LIFE.trending);
      global[i] += w;
      if (region && e.region === region) {
        local[i] += w;
        regionalEvidence += w;
      }
    }

    const normalise = (xs: Float64Array) => {
      const max = Math.max(...xs, 1e-9);
      return Array.from(xs, (x) => x / max);
    };
    const g = normalise(global);
    const l = normalise(local);
    const lambda = regionalEvidence / (regionalEvidence + REGION_EVIDENCE_HALF);
    const place = region ? regionName(region) : "";

    return {
      // A small rating prior orders items that have no recent activity.
      scores: this.products.map(
        (p, i) => lambda * l[i] + (1 - lambda) * g[i] + 0.01 * (p.rating / 5),
      ),
      reason: (i: number) =>
        region && lambda * l[i] > (1 - lambda) * g[i] ? `Popular in ${place}` : "Trending now",
    };
  }

  private profileScores(
    weights: Map<number, number>,
    exclude: Set<number>,
    explain: (anchorIndex: number) => string,
  ): Scored[] {
    const { sim, support } = this.model();
    const n = this.products.length;
    const total = [...weights.values()].reduce((s, w) => s + w, 0) || 1;

    const scored: Scored[] = [];
    for (let j = 0; j < n; j++) {
      if (exclude.has(j)) continue;
      let score = 0;
      let bestAnchor = -1;
      let bestContribution = 0;
      for (const [i, w] of weights) {
        if (i === j) continue;
        const alpha = this.collabShare(support[i]);
        const s = alpha * sim[i * n + j] + (1 - alpha) * this.content[i * n + j];
        const contribution = (w / total) * s;
        score += contribution;
        if (contribution > bestContribution) {
          bestContribution = contribution;
          bestAnchor = i;
        }
      }
      if (score <= 0 || bestAnchor === -1) continue;
      scored.push({ index: j, score, reason: explain(bestAnchor) });
    }
    return scored;
  }

  /** Ranks with category diversity, then pads with trending items if short. */
  private finalize(
    scored: Scored[],
    limit: number,
    exclude: Set<number>,
    region?: string,
    diversify = true,
  ): Recommendation[] {
    const pool = scored.filter((s) => !exclude.has(s.index)).sort((a, b) => b.score - a.score);
    const picked: Scored[] = [];
    const perCategory = new Map<Category, number>();

    while (picked.length < limit && pool.length > 0) {
      let bestIdx = 0;
      let bestAdjusted = -Infinity;
      for (let k = 0; k < pool.length; k++) {
        const seen = diversify ? (perCategory.get(this.products[pool[k].index].category) ?? 0) : 0;
        const adjusted = pool[k].score * Math.pow(CATEGORY_DIVERSITY_PENALTY, seen);
        if (adjusted > bestAdjusted) {
          bestAdjusted = adjusted;
          bestIdx = k;
        }
      }
      const [choice] = pool.splice(bestIdx, 1);
      picked.push(choice);
      const cat = this.products[choice.index].category;
      perCategory.set(cat, (perCategory.get(cat) ?? 0) + 1);
    }

    if (picked.length < limit && diversify) {
      const taken = new Set([...exclude, ...picked.map((p) => p.index)]);
      for (const extra of this.trending(limit - picked.length, { region, exclude: taken })) {
        picked.push({ index: this.indexOf.get(extra.product.id)!, score: 0, reason: extra.reason });
      }
    }

    return picked.map((s) => ({
      product: this.products[s.index],
      score: Math.round(s.score * 1000) / 1000,
      reason: s.reason,
    }));
  }

  private collabShare(support: number) {
    return MAX_COLLAB_SHARE * (support / (support + COLLAB_SUPPORT_HALF));
  }

  private indices(ids: string[]) {
    return ids.map((id) => this.indexOf.get(id)).filter((i): i is number => i !== undefined);
  }

  private model() {
    const now = Date.now();
    if (!this.collab || (this.collabStale && now - this.collabBuiltAt >= COLLAB_REBUILD_INTERVAL)) {
      this.collab = buildCollaborativeModel(this.events, this.indexOf, now);
      this.collabBuiltAt = now;
      this.collabStale = false;
    }
    return this.collab;
  }
}
