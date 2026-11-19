import type { Db } from "./client";

/**
 * Ordered, append-only migrations. Never edit one that has shipped; add a new entry instead.
 * Each runs once, inside a transaction, and is recorded in `schema_migrations`.
 */
const MIGRATIONS: { id: string; sql: string }[] = [
  {
    id: "001_initial",
    sql: `
      CREATE TABLE products (
        id          text PRIMARY KEY,
        name        text NOT NULL,
        category    text NOT NULL,
        price       numeric(12, 2) NOT NULL CHECK (price >= 0),
        rating      real NOT NULL DEFAULT 0,
        image       text NOT NULL,
        description text NOT NULL DEFAULT '',
        tags        jsonb NOT NULL DEFAULT '[]',
        colors      jsonb NOT NULL DEFAULT '[]',
        sizes       jsonb NOT NULL DEFAULT '[]',
        created_at  timestamptz NOT NULL DEFAULT now()
      );

      -- Shopper interactions that feed the recommender.
      CREATE TABLE events (
        id          bigserial PRIMARY KEY,
        user_id     text NOT NULL,
        product_id  text NOT NULL,
        type        text NOT NULL CHECK (type IN ('view', 'cart', 'purchase')),
        region      text,
        occurred_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX events_occurred_at_idx ON events (occurred_at);
      CREATE INDEX events_user_id_idx ON events (user_id);

      CREATE TABLE users (
        id            uuid PRIMARY KEY,
        username      text NOT NULL,
        email         text NOT NULL,
        first_name    text NOT NULL,
        last_name     text NOT NULL,
        is_seller     boolean NOT NULL DEFAULT false,
        password_hash text NOT NULL,
        verified      boolean NOT NULL DEFAULT false,
        created_at    timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX users_username_key ON users (lower(username));
      CREATE UNIQUE INDEX users_email_key ON users (email);

      CREATE TABLE sessions (
        token_hash text PRIMARY KEY,
        user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL
      );
      CREATE INDEX sessions_user_id_idx ON sessions (user_id);

      -- At most one pending email verification code per user.
      CREATE TABLE otps (
        user_id    uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
        code_hash  text NOT NULL,
        expires_at timestamptz NOT NULL,
        attempts   integer NOT NULL DEFAULT 0,
        sent_at    timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE addresses (
        id                     uuid PRIMARY KEY,
        user_id                uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        first_name             text NOT NULL,
        last_name              text NOT NULL,
        phone                  text NOT NULL,
        additional_phone       text,
        state                  text,
        city                   text NOT NULL,
        address                text NOT NULL,
        additional_information text,
        is_default             boolean NOT NULL DEFAULT false,
        created_at             timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX addresses_user_id_idx ON addresses (user_id);

      -- Admin-uploaded product images. Move to object storage (S3/R2) at scale.
      CREATE TABLE uploads (
        name         text PRIMARY KEY,
        content_type text NOT NULL,
        data         bytea NOT NULL,
        created_at   timestamptz NOT NULL DEFAULT now()
      );
    `,
  },
];

export async function migrate(db: Db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  const applied = new Set(
    (await db.query<{ id: string }>("SELECT id FROM schema_migrations")).map((r) => r.id),
  );
  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue;
    await db.transaction(async (tx) => {
      // Statements are split so this works with drivers that reject multi-statement queries.
      for (const statement of migration.sql.split(";").map((s) => s.trim()).filter(Boolean)) {
        await tx.query(statement);
      }
      await tx.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migration.id]);
    });
  }
}
