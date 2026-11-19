import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { Elysia, t, type ElysiaConfig } from "elysia";
import { cors } from "@elysiajs/cors";
import { AccountStore } from "./accounts/store";
import { consoleMailer, type Mailer } from "./accounts/mailer";
import { Catalog } from "./catalog";
import { SEED_PRODUCTS } from "./data/products";
import { generateSeedEvents } from "./data/seed-events";
import type { Db } from "./db/client";
import { loadRecentEvents, saveEvents } from "./events";
import { Recommender } from "./recommender/engine";
import { accountRoutes } from "./routes/accounts";
import { CATEGORIES, EVENT_TYPES, type Product } from "./types";

const limitQuery = t.Optional(t.Numeric({ minimum: 1, maximum: 50 }));
const category = t.UnionEnum(CATEGORIES);
// Optional enums in *query strings* are plain patterned strings: Elysia fills a missing
// optional UnionEnum query param with the enum's first value, which silently filtered
// every unfiltered request down to "women".
const enumQuery = <T extends string>(values: readonly T[]) =>
  t.Optional(t.Unsafe<T>(t.String({ pattern: `^(${values.join("|")})$` })));
const categoryQuery = enumQuery(CATEGORIES);
const regionHint = t.Optional(t.String({ pattern: "^[A-Za-z]{2}$" }));

const productFields = {
  name: t.String({ minLength: 1, maxLength: 120 }),
  category,
  price: t.Number({ minimum: 0, maximum: 1_000_000 }),
  // Site-relative path or http(s) URL only - never javascript:/data: URLs.
  image: t.String({ pattern: "^(https?://|/)", maxLength: 500 }),
  description: t.String({ maxLength: 2000 }),
  tags: t.Array(t.String({ minLength: 1, maxLength: 40 }), { maxItems: 20 }),
  colors: t.Array(t.String({ minLength: 1, maxLength: 30 }), { maxItems: 20 }),
  sizes: t.Array(t.String({ minLength: 1, maxLength: 10 }), { maxItems: 20 }),
  rating: t.Optional(t.Number({ minimum: 0, maximum: 5 })),
};

/** Geo headers set by common CDNs / hosts. These win over the browser's own hint. */
const GEO_HEADERS = ["cf-ipcountry", "x-vercel-ip-country", "cloudfront-viewer-country", "x-country-code"];

function resolveRegion(headers: Record<string, string | undefined>, hint?: string) {
  for (const candidate of [...GEO_HEADERS.map((h) => headers[h]), hint]) {
    const code = candidate?.trim().toUpperCase();
    // XX = unknown and T1 = Tor on Cloudflare.
    if (code && /^[A-Z]{2}$/.test(code) && code !== "XX" && code !== "T1") return code;
  }
  return undefined;
}

const UPLOAD_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const UPLOAD_NAME = /^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

function sameSecret(a: string, b: string) {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export interface AppOptions {
  /** Origins allowed to call the API. Defaults to the Next.js dev server. */
  corsOrigin?: string | string[];
  /** Mix synthetic shopper history into the model so recommendations work out of the box. */
  seed?: boolean;
  /** Postgres (or PGlite) connection; see `db/client.ts`. */
  db: Db;
  /** Bearer token for /admin routes. Admin routes are disabled when unset. */
  adminToken?: string;
  /** Public base URL of this API, used to build links to uploaded images. */
  publicUrl?: string;
  /** Delivers sign-up verification codes. Defaults to logging them to the console. */
  mailer?: Mailer;
  adapter?: ElysiaConfig<"">["adapter"];
}

export async function createApp({
  corsOrigin = "http://localhost:3000",
  seed = true,
  db,
  adminToken,
  publicUrl = "http://localhost:4000",
  mailer = consoleMailer,
  adapter,
}: AppOptions) {
  const accounts = new AccountStore(db);
  const catalog = await Catalog.load(db, SEED_PRODUCTS);
  // Synthetic demo shoppers live only in memory; real events come from the database.
  const recommender = new Recommender(catalog.all(), [
    ...(seed ? generateSeedEvents(SEED_PRODUCTS) : []),
    ...(await loadRecentEvents(db)),
  ]);
  catalog.onChange((products) => recommender.setProducts(products));

  return (
    new Elysia({ adapter })
      // credentials: the shop sends the session cookie cross-origin (localhost:3000 -> :4000).
      .use(cors({ origin: corsOrigin, credentials: true }))
      .use(accountRoutes({ accounts, mailer, secureCookies: publicUrl.startsWith("https://") }))
      .decorate({ catalog, recommender })
      .get("/health", async ({ catalog, recommender, status }) => {
        try {
          await db.query("SELECT 1");
        } catch {
          return status(503, { status: "database unavailable" });
        }
        return { status: "ok", products: catalog.all().length, events: recommender.eventCount };
      })

      .get("/categories", () => CATEGORIES)

      .get(
        "/products",
        ({ query, catalog }) => {
          const q = query.q?.trim().toLowerCase();
          const colors = query.colors?.split(",").filter(Boolean) ?? [];
          const sizes = query.sizes?.split(",").filter(Boolean) ?? [];
          const items = catalog
            .all()
            .filter(
              (p) =>
                (!query.category || p.category === query.category) &&
                (query.minPrice === undefined || p.price >= query.minPrice) &&
                (query.maxPrice === undefined || p.price <= query.maxPrice) &&
                (colors.length === 0 || p.colors.some((c) => colors.includes(c))) &&
                (sizes.length === 0 || p.sizes.some((size) => sizes.includes(size))) &&
                (!q ||
                  p.name.toLowerCase().includes(q) ||
                  p.tags.some((tag) => tag.includes(q)) ||
                  p.category.includes(q)),
            );

          const sorters: Record<string, (a: Product, b: Product) => number> = {
            newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
            "price-asc": (a, b) => a.price - b.price,
            "price-desc": (a, b) => b.price - a.price,
            rating: (a, b) => b.rating - a.rating,
          };
          items.sort(sorters[query.sort ?? "newest"]);

          const offset = query.offset ?? 0;
          const limit = query.limit ?? 24;
          return { items: items.slice(offset, offset + limit), total: items.length };
        },
        {
          query: t.Object({
            category: categoryQuery,
            q: t.Optional(t.String({ maxLength: 100 })),
            minPrice: t.Optional(t.Numeric({ minimum: 0 })),
            maxPrice: t.Optional(t.Numeric({ minimum: 0 })),
            /** comma-separated, matches any */
            colors: t.Optional(t.String()),
            /** comma-separated, matches any */
            sizes: t.Optional(t.String()),
            sort: enumQuery(["newest", "price-asc", "price-desc", "rating"] as const),
            limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
            offset: t.Optional(t.Numeric({ minimum: 0 })),
          }),
        },
      )

      .get("/products/:id", ({ params, catalog, status }) => {
        return catalog.get(params.id) ?? status(404, { error: "Product not found" });
      })

      .get("/uploads/:name", async ({ params, status }) => {
        if (!UPLOAD_NAME.test(params.name)) return status(404, { error: "Not found" });
        const [upload] = await db.query<{ content_type: string; data: Uint8Array }>(
          "SELECT content_type, data FROM uploads WHERE name = $1",
          [params.name],
        );
        if (!upload) return status(404, { error: "Not found" });
        return new Response(new Uint8Array(upload.data), {
          headers: {
            "Content-Type": upload.content_type,
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      })

      .group("/recommendations", (app) =>
        app
          .get(
            "/trending",
            ({ query, headers, recommender }) =>
              recommender.trending(query.limit, {
                category: query.category,
                region: resolveRegion(headers, query.region),
              }),
            {
              query: t.Object({ limit: limitQuery, category: categoryQuery, region: regionHint }),
            },
          )
          .get(
            "/similar/:id",
            ({ params, query, recommender, status }) =>
              recommender.hasProduct(params.id)
                ? recommender.similar(params.id, query.limit)
                : status(404, { error: "Product not found" }),
            { query: t.Object({ limit: limitQuery }) },
          )
          .post(
            "/basket",
            ({ body, headers, recommender }) =>
              recommender.forBasket(body.productIds, body.limit, resolveRegion(headers, body.region)),
            {
              body: t.Object({
                productIds: t.Array(t.String(), { maxItems: 100 }),
                limit: t.Optional(t.Integer({ minimum: 1, maximum: 50 })),
                region: regionHint,
              }),
            },
          )
          .get(
            "/user/:userId",
            ({ params, query, headers, recommender }) =>
              recommender.forUser(params.userId, query.limit, {
                exclude: query.exclude?.split(",").filter(Boolean),
                region: resolveRegion(headers, query.region),
              }),
            {
              query: t.Object({ limit: limitQuery, exclude: t.Optional(t.String()), region: regionHint }),
            },
          ),
      )

      .post(
        "/events",
        async ({ body, headers, catalog, recommender, status }) => {
          const unknown = body.productIds.filter((id) => !catalog.get(id));
          if (unknown.length > 0) return status(400, { error: `Unknown products: ${unknown.join(", ")}` });

          const timestamp = Date.now();
          const region = resolveRegion(headers, body.region);
          const events = body.productIds.map((productId) => ({
            userId: body.userId,
            productId,
            type: body.type,
            timestamp,
            region,
          }));
          await saveEvents(db, events);
          for (const e of events) recommender.record(e);
          return { recorded: events.length };
        },
        {
          body: t.Object({
            userId: t.String({ minLength: 1, maxLength: 100 }),
            type: t.UnionEnum(EVENT_TYPES),
            productIds: t.Array(t.String(), { minItems: 1, maxItems: 100 }),
            region: regionHint,
          }),
        },
      )

      .group(
        "/admin",
        {
          beforeHandle({ headers, status }) {
            if (!adminToken) return status(503, { error: "Admin API disabled: set ADMIN_TOKEN" });
            const given = headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
            if (!sameSecret(given, adminToken)) return status(401, { error: "Invalid admin token" });
          },
        },
        (app) =>
          app
            .get(
              "/model/export",
              ({ query, recommender, set }) => {
                const stamp = new Date().toISOString().replace(/[:.]/g, "-");
                set.headers["content-disposition"] =
                  `attachment; filename="shop-model-${stamp}.json"`;
                return recommender.exportSnapshot(query.neighbours);
              },
              { query: t.Object({ neighbours: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })) }) },
            )
            .get("/stats", ({ catalog, recommender }) => ({
              products: catalog.all().length,
              ...recommender.stats(),
            }))
            .post("/products", async ({ body, catalog }) => catalog.add(body), {
              body: t.Object(productFields),
            })
            .patch(
              "/products/:id",
              async ({ params, body, catalog, status }) =>
                (await catalog.update(params.id, body)) ?? status(404, { error: "Product not found" }),
              { body: t.Partial(t.Object(productFields)) },
            )
            .delete("/products/:id", async ({ params, catalog, status }) =>
              (await catalog.remove(params.id))
                ? { deleted: params.id }
                : status(404, { error: "Product not found" }),
            )
            .post(
              "/uploads",
              async ({ body, status }) => {
                const ext = UPLOAD_TYPES[body.file.type];
                if (!ext) return status(415, { error: "Use a PNG, JPEG, WebP or GIF image" });
                const name = `${randomUUID()}.${ext}`;
                await db.query("INSERT INTO uploads (name, content_type, data) VALUES ($1, $2, $3)", [
                  name,
                  body.file.type,
                  Buffer.from(await body.file.arrayBuffer()),
                ]);
                return { url: `${publicUrl.replace(/\/$/, "")}/uploads/${name}` };
              },
              {
                // Elysia checks the file's magic bytes, not just the client-declared type.
                body: t.Object({ file: t.File({ type: Object.keys(UPLOAD_TYPES), maxSize: "5m" }) }),
              },
            ),
      )
  );
}

export type App = ReturnType<typeof createApp>;
