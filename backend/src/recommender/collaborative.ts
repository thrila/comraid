import type { EventType, InteractionEvent } from "../types";

export const EVENT_WEIGHTS: Record<EventType, number> = {
  view: 1,
  cart: 3,
  purchase: 5,
};

const DAY = 24 * 60 * 60 * 1000;

/** Exponential decay so recent behaviour counts more than old behaviour. */
export function decay(timestamp: number, now: number, halfLifeDays: number) {
  const ageDays = Math.max(0, now - timestamp) / DAY;
  return Math.pow(0.5, ageDays / halfLifeDays);
}

/** Overlaps backed by only one or two shoppers are shrunk towards zero. */
const SHRINKAGE = 3;

export interface CollaborativeModel {
  /** N×N item-item similarity */
  sim: Float64Array;
  /** Number of distinct users who interacted with each item */
  support: Uint32Array;
}

/**
 * Item-item collaborative filtering: two products are similar when the same
 * shoppers engage with both. Uses cosine similarity over implicit-feedback scores.
 */
export function buildCollaborativeModel(
  events: InteractionEvent[],
  indexOf: Map<string, number>,
  now = Date.now(),
): CollaborativeModel {
  const n = indexOf.size;

  // user -> (item index -> implicit rating)
  const ratings = new Map<string, Map<number, number>>();
  for (const e of events) {
    const i = indexOf.get(e.productId);
    if (i === undefined) continue;
    let row = ratings.get(e.userId);
    if (!row) ratings.set(e.userId, (row = new Map()));
    row.set(i, (row.get(i) ?? 0) + EVENT_WEIGHTS[e.type] * decay(e.timestamp, now, 30));
  }

  const dot = new Float64Array(n * n);
  const coCount = new Uint32Array(n * n);
  const sqNorm = new Float64Array(n);
  const support = new Uint32Array(n);

  for (const row of ratings.values()) {
    const items = [...row.entries()];
    for (const [i, ri] of items) {
      sqNorm[i] += ri * ri;
      support[i]++;
    }
    for (let a = 0; a < items.length; a++) {
      const [i, ri] = items[a];
      for (let b = a + 1; b < items.length; b++) {
        const [j, rj] = items[b];
        dot[i * n + j] += ri * rj;
        dot[j * n + i] += ri * rj;
        coCount[i * n + j]++;
        coCount[j * n + i]++;
      }
    }
  }

  const sim = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const k = i * n + j;
      if (i === j || dot[k] === 0) continue;
      const cosine = dot[k] / Math.sqrt(sqNorm[i] * sqNorm[j]);
      sim[k] = cosine * (coCount[k] / (coCount[k] + SHRINKAGE));
    }
  }

  return { sim, support };
}
