# Shop API

The [Elysia](https://elysiajs.com) backend for the shop: accounts and addresses, the product catalogue, and live personalised recommendations.

## Run it

```bash
cd backend
cp .env.example .env   # set ADMIN_TOKEN; set DATABASE_URL for a real Postgres
npm install

bun run dev            # with Bun (recommended)
npm run dev:node       # or with Node 22+, using the Elysia Node adapter
```

The API listens on `http://localhost:4000`. Run the tests with `npm test`.

## Database

The API stores everything in **Postgres**: products, shopper events, users, sessions, verification codes, addresses and uploaded images.

- **Production:** set `DATABASE_URL` (for example `postgres://user:pass@host:5432/shop`). Any Postgres 14+ works, including Neon, Supabase, RDS and Railway.
- **Development:** with no `DATABASE_URL`, the API runs an embedded Postgres ([PGlite](https://pglite.dev)) stored in `data/pglite/`, so no setup is needed. Tests use an in-memory PGlite. Both run the same SQL as production.
- **Schema:** migrations live in `src/db/schema.ts` and run automatically on startup. To change the schema, add a new migration entry; never edit one that has shipped.
- **First boot:** the empty `products` table is filled with the demo catalogue. After that, the admin page manages it.

## Demo images

The demo catalogue ships with generated product illustrations in `public/images/products/`. Regenerate them with `npm run seed:images`.

To use real photos instead, add a free `UNSPLASH_ACCESS_KEY` and run `npm run seed:photos`. It uses the official Unsplash API to download one photo per product, saves photographer credits to `public/images/products/CREDITS.md`, and records the mapping in `src/data/photos.json`. If the API is running and `ADMIN_TOKEN` is set, it also updates products already in the database.

## How recommendations work

Everything is live. Each view, add-to-cart, purchase, or catalogue edit counts on the next request. No batch job or retraining step is needed.

| Signal | Used for |
| --- | --- |
| **Content similarity**: TF-IDF over category, tags, colours and price band | "Similar style" items; cold-start for new products |
| **Item-item collaborative filtering**: cosine over implicit feedback (view 1, cart 3, purchase 5), with recency decay and shrinkage | "Shoppers who liked this also liked" |
| **Regional popularity**: shrunk towards global popularity when a region has little data | What a brand-new shopper sees ("Popular in Nigeria") |
| **Shopper profile**: 14-day taste plus a ~1-hour in-session boost | "Because you viewed / added / bought …" |

The hybrid blend shifts with the evidence available:

- The weight of collaborative versus content similarity grows with how many shoppers have interacted with an item, so new products still get sensible neighbours.
- The For You feed starts as regional popularity and moves toward the shopper's own history as that history grows. Recent activity counts most, so the feed reacts within the session.
- Results are re-ranked for category diversity, purchased items are hidden, and every recommendation carries a human-readable `reason`.

The region comes from CDN geo headers (`cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`) when the API runs behind one. Otherwise it falls back to the `region` hint the browser sends, which is derived from its timezone.

## Accounts

Sign-up sends a 6-digit code by email. It expires after 10 minutes and allows 5 tries. Logging in sets an httpOnly `sid` session cookie, valid for 1 day, or 30 days with "remember me". Passwords are hashed with scrypt. Login attempts are limited to 10 per account every 15 minutes.

Email delivery is pluggable through the `Mailer` interface (`src/accounts/mailer.ts`). The default mailer prints codes to the server console, so a real provider must be connected before launch.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/register` | `{ username, first_name, last_name, email, password, is_seller? }`: emails a code |
| POST | `/auth/verify-otp` | `{ email, otp }`: verifies the email and signs the user in |
| POST | `/auth/resend-otp` | `{ email }`: at most once a minute |
| POST | `/auth/login` | `{ username, password, remember? }`: `username` may also be an email |
| POST | `/auth/logout` | |
| GET | `/auth/me` | The signed-in user, or `401` |
| GET/POST | `/addresses` | The signed-in user's addresses. The first one becomes the default |
| PATCH/DELETE | `/addresses/:id` | |

The shop calls the API from another origin, so `CORS_ORIGIN` must list the shop's exact origin for the cookie to be sent. In production, serve the API over https on the same site as the shop (for example `api.example.com` and `example.com`).

## Catalogue and recommendation endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/products` | `category`, `q`, `minPrice`, `maxPrice`, `colors`, `sizes` (comma-separated), `sort`, `limit`, `offset` |
| GET | `/products/:id` | |
| GET | `/recommendations/user/:userId` | For You feed. `limit`, `exclude` (comma-separated ids), `region` |
| GET | `/recommendations/similar/:id` | `limit` |
| POST | `/recommendations/basket` | `{ productIds, limit?, region? }` |
| GET | `/recommendations/trending` | `limit`, `category`, `region` |
| POST | `/events` | `{ userId, type: "view" \| "cart" \| "purchase", productIds, region? }` |
| GET | `/uploads/:name` | Uploaded product images |

Admin routes need `Authorization: Bearer $ADMIN_TOKEN`. If `ADMIN_TOKEN` is unset they return `503`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/stats` | Interaction counts, activity by region, most engaged products |
| GET | `/admin/model/export` | Downloads a JSON snapshot of the learned model: each product's top `neighbours` (default 20) with hybrid, collaborative and content scores, global and per-region popularity, and the settings used |
| POST | `/admin/products` | Create a product (the id is generated from the name) |
| PATCH | `/admin/products/:id` | Partial update |
| DELETE | `/admin/products/:id` | |
| POST | `/admin/uploads` | Multipart `file`: PNG, JPEG, WebP or GIF, 5 MB max (checked by content) |

## Production notes

- Set `SEED_DEMO_DATA=false` to stop mixing synthetic demo shoppers into the model.
- The recommender loads the last 180 days of events from Postgres at startup and keeps its model in memory. That suits catalogues up to a few thousand products. Beyond that, precompute neighbours on a schedule.
- Recommendation shopper ids are anonymous per-browser ids, not yet linked to accounts, so personalisation does not follow a user across devices.
- Login rate limits and the in-memory recommender are per instance. To run several API instances, move rate limits to Redis or Postgres, and refresh each instance's catalogue when an admin edits it.
