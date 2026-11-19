import { mkdirSync } from "node:fs";
import type { Sql, TransactionSql } from "postgres";
import { migrate } from "./schema";

/**
 * The tiny slice of a SQL client the app needs. Implemented by postgres.js for a real
 * Postgres server and by PGlite (Postgres compiled to WASM) for local dev and tests, so
 * exactly the same SQL runs everywhere.
 */
export interface Db {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  transaction<R>(fn: (tx: Db) => Promise<R>): Promise<R>;
  close(): Promise<void>;
}

/** Production: a real Postgres server, e.g. `postgres://user:pass@host:5432/shop`. */
export async function connectPostgres(url: string): Promise<Db> {
  const { default: postgres } = await import("postgres");
  const sql = postgres(url, { max: 10, onnotice: () => {} });

  const wrap = (s: Sql | TransactionSql): Db => ({
    query: async <T>(text: string, params: unknown[] = []) =>
      (await s.unsafe(text, params as never[])) as unknown as T[],
    transaction: async (fn) =>
      "begin" in s
        ? ((await s.begin((tx) => fn(wrap(tx)))) as Awaited<ReturnType<typeof fn>>)
        : fn(wrap(s)), // already inside a transaction
    close: async () => {
      if ("end" in s) await s.end();
    },
  });

  const db = wrap(sql);
  await migrate(db);
  return db;
}

/**
 * Embedded Postgres (PGlite). With `dataDir` the database is kept on disk; without it,
 * it lives in memory (tests). Fine for development, not for production traffic.
 */
export async function connectPglite(dataDir?: string): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  if (dataDir) mkdirSync(dataDir, { recursive: true });
  const pg = new PGlite(dataDir);

  type Conn = Pick<typeof pg, "query"> & Partial<Pick<typeof pg, "transaction" | "close">>;
  const wrap = (c: Conn): Db => ({
    query: async <T>(text: string, params: unknown[] = []) =>
      (await c.query<T>(text, params)).rows,
    transaction: (fn) => (c.transaction ? c.transaction((tx) => fn(wrap(tx))) : fn(wrap(c))),
    close: async () => {
      await c.close?.();
    },
  });

  const db = wrap(pg);
  await migrate(db);
  return db;
}
