import { createApp } from "./app";
import { connectPglite, connectPostgres } from "./db/client";

const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? "http://localhost:3000";
const dataDir = process.env.DATA_DIR ?? new URL("../data", import.meta.url).pathname;

if (!process.env.ADMIN_TOKEN) {
  console.warn("ADMIN_TOKEN is not set - the /admin API is disabled.");
}
if (process.env.NODE_ENV === "production") {
  console.warn("Sign-up codes are only logged to the console - configure a real Mailer before launch.");
}

// Postgres when DATABASE_URL is set; otherwise an embedded Postgres (PGlite) on disk so
// the API runs with zero setup in development.
const db = process.env.DATABASE_URL
  ? await connectPostgres(process.env.DATABASE_URL)
  : await connectPglite(`${dataDir}/pglite`);
if (!process.env.DATABASE_URL) {
  console.warn(`DATABASE_URL is not set - using embedded Postgres at ${dataDir}/pglite (dev only).`);
}

// Elysia runs natively on Bun; under Node it needs the Node adapter.
const adapter =
  typeof globalThis.Bun === "undefined" ? (await import("@elysiajs/node")).node() : undefined;

const app = await createApp({
  db,
  corsOrigin,
  adapter,
  adminToken: process.env.ADMIN_TOKEN,
  publicUrl: process.env.PUBLIC_URL ?? `http://localhost:${port}`,
  seed: process.env.SEED_DEMO_DATA !== "false",
});

app.listen(port, () => {
  console.log(`Shop API listening on http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await app.stop();
    await db.close();
    process.exit(0);
  });
}
