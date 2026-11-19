import type { Db } from "./db/client";
import type { EventType, InteractionEvent } from "./types";

/** How far back the recommender looks when it loads history at boot. */
const HISTORY_DAYS = 180;

interface EventRow {
  user_id: string;
  product_id: string;
  type: EventType;
  region: string | null;
  occurred_at: Date | string;
}

export async function loadRecentEvents(db: Db): Promise<InteractionEvent[]> {
  const rows = await db.query<EventRow>(
    `SELECT user_id, product_id, type, region, occurred_at FROM events
     WHERE occurred_at > now() - make_interval(days => $1)
     ORDER BY occurred_at`,
    [HISTORY_DAYS],
  );
  return rows.map((r) => ({
    userId: r.user_id,
    productId: r.product_id,
    type: r.type,
    region: r.region ?? undefined,
    timestamp: new Date(r.occurred_at).getTime(),
  }));
}

export async function saveEvents(db: Db, events: InteractionEvent[]) {
  if (events.length === 0) return;
  // One multi-row insert: ($1,$2,$3,$4,$5), ($6,...)...
  const values = events
    .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
    .join(", ");
  await db.query(
    `INSERT INTO events (user_id, product_id, type, region, occurred_at) VALUES ${values}`,
    events.flatMap((e) => [e.userId, e.productId, e.type, e.region ?? null, new Date(e.timestamp).toISOString()]),
  );
}
