import type { Category, InteractionEvent, Product } from "../types";

/** Small deterministic PRNG so the seeded history is the same on every boot. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shopper personas. Each one prefers a mix of categories and tags, which gives the
 * collaborative filter realistic cross-category patterns to learn (e.g. streetwear
 * shoppers buying both hoodies and high-tops).
 */
const PERSONAS: { categories: Partial<Record<Category, number>>; tags: string[] }[] = [
  { categories: { men: 0.5, sneakers: 0.5 }, tags: ["streetwear", "casual"] },
  { categories: { women: 0.6, cosmetics: 0.4 }, tags: ["makeup", "dress", "evening"] },
  { categories: { women: 0.8, sneakers: 0.2 }, tags: ["boots", "leather", "winter"] },
  { categories: { cosmetics: 1 }, tags: ["skincare"] },
  { categories: { men: 0.8, women: 0.2 }, tags: ["office", "formal"] },
  { categories: { sneakers: 0.7, men: 0.3 }, tags: ["sport", "running"] },
  { categories: { women: 0.5, cosmetics: 0.3, sneakers: 0.2 }, tags: ["summer"] },
];

/**
 * Each region leans towards different styles, so a brand-new shopper's regional
 * cold-start feed differs from the global one.
 */
const REGIONS: { code: string; tags: string[]; categories: Partial<Record<Category, number>> }[] = [
  { code: "NG", tags: ["evening", "makeup", "fragrance"], categories: { women: 0.3, cosmetics: 0.3 } },
  { code: "GB", tags: ["winter", "outerwear", "boots"], categories: { women: 0.2, men: 0.2 } },
  { code: "US", tags: ["sport", "basketball", "streetwear"], categories: { sneakers: 0.4 } },
  { code: "GH", tags: ["streetwear", "summer", "linen"], categories: { men: 0.4 } },
  { code: "KE", tags: ["running", "trail", "skincare"], categories: { sneakers: 0.2, cosmetics: 0.2 } },
];

export function generateSeedEvents(
  products: Product[],
  { users = 80, now = Date.now(), seed = 42 } = {},
): InteractionEvent[] {
  const rand = mulberry32(seed);
  const events: InteractionEvent[] = [];
  const DAY = 24 * 60 * 60 * 1000;

  for (let u = 0; u < users; u++) {
    const persona = PERSONAS[u % PERSONAS.length];
    const region = REGIONS[Math.floor(rand() * REGIONS.length)];
    const userId = `seed-user-${u}`;
    const tags = [...persona.tags, ...region.tags];

    // Weight every product by how well it fits the persona.
    const weighted = products.map((p) => {
      const catWeight =
        (persona.categories[p.category] ?? 0.02) + (region.categories[p.category] ?? 0);
      const tagHits = p.tags.filter((t) => tags.includes(t)).length;
      return { p, w: catWeight * (1 + 1.5 * tagHits) * (0.5 + rand()) };
    });
    weighted.sort((a, b) => b.w - a.w);

    const sessionSize = 4 + Math.floor(rand() * 8);
    const browsed = weighted.slice(0, sessionSize + 4).filter(() => rand() < 0.75);

    for (const { p } of browsed.slice(0, sessionSize)) {
      const timestamp = now - Math.floor(rand() * 30 * DAY);
      events.push({ userId, productId: p.id, type: "view", timestamp, region: region.code });
      if (rand() < 0.4) {
        events.push({
          userId,
          productId: p.id,
          type: "cart",
          timestamp: timestamp + 60_000,
          region: region.code,
        });
        if (rand() < 0.5) {
          events.push({
            userId,
            productId: p.id,
            type: "purchase",
            timestamp: timestamp + 600_000,
            region: region.code,
          });
        }
      }
    }
  }

  return events;
}
