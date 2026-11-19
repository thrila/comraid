import { test } from "node:test";
import assert from "node:assert/strict";
import { SEED_PRODUCTS as PRODUCTS } from "../src/data/products";
import { generateSeedEvents } from "../src/data/seed-events";
import { Recommender } from "../src/recommender/engine";
import { createApp } from "../src/app";
import { connectPglite } from "../src/db/client";
import type { InteractionEvent } from "../src/types";

const seeded = () => new Recommender(PRODUCTS, generateSeedEvents(PRODUCTS));
const now = Date.now();

test("catalogue ids are unique", () => {
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length);
});

test("similar() never returns the product itself and respects the limit", () => {
  const recs = seeded().similar("ladies-high-ankle-boots", 5);
  assert.equal(recs.length, 5);
  assert.ok(recs.every((r) => r.product.id !== "ladies-high-ankle-boots"));
});

test("content similarity works with no behaviour data (cold start)", () => {
  const recs = new Recommender(PRODUCTS).similar("ladies-high-ankle-boots", 3);
  assert.equal(recs[0].product.id, "ladies-chelsea-boots");
  assert.equal(recs[0].reason, "Similar style");
});

test("collaborative signal picks up co-purchases across categories", () => {
  const events = Array.from({ length: 30 }, (_, u) =>
    ["relaxed-fit-hoodie", "retro-high-top-sneakers"].map((productId) => ({
      userId: `u${u}`,
      productId,
      type: "purchase" as const,
      timestamp: now,
    })),
  ).flat();
  const recs = new Recommender(PRODUCTS, events).similar("relaxed-fit-hoodie", 3);
  assert.equal(recs[0].product.id, "retro-high-top-sneakers");
});

test("forBasket() excludes basket items", () => {
  const basket = ["air-runner-sneakers", "graphic-cotton-tee"];
  const recs = seeded().forBasket(basket, 8);
  assert.equal(recs.length, 8);
  assert.ok(recs.every((r) => !basket.includes(r.product.id)));
});

test("new shoppers get what is popular in their region", () => {
  // Two regions with opposite tastes.
  const events: InteractionEvent[] = [];
  for (let u = 0; u < 20; u++) {
    events.push({ userId: `ng${u}`, productId: "wrap-evening-gown", type: "purchase", timestamp: now, region: "NG" });
    events.push({ userId: `us${u}`, productId: "basketball-mid-sneakers", type: "purchase", timestamp: now, region: "US" });
  }
  const r = new Recommender(PRODUCTS, events);

  const ng = r.forUser("new-nigerian-shopper", 3, { region: "NG" });
  assert.equal(ng[0].product.id, "wrap-evening-gown");
  assert.equal(ng[0].reason, "Popular in Nigeria");

  const us = r.forUser("new-american-shopper", 3, { region: "US" });
  assert.equal(us[0].product.id, "basketball-mid-sneakers");
});

test("regions with little data fall back towards global popularity", () => {
  const events: InteractionEvent[] = [
    { userId: "a", productId: "volume-mascara", type: "view", timestamp: now, region: "FR" },
    ...Array.from({ length: 30 }, (_, u) => ({
      userId: `g${u}`,
      productId: "air-runner-sneakers",
      type: "purchase" as const,
      timestamp: now,
      region: "US",
    })),
  ];
  const recs = new Recommender(PRODUCTS, events).trending(1, { region: "FR" });
  assert.equal(recs[0].product.id, "air-runner-sneakers");
  assert.equal(recs[0].reason, "Trending now");
});

test("forUser() moves from regional taste to personal history as history grows", () => {
  const r = seeded();
  r.record({ userId: "me", productId: "volume-mascara", type: "view", timestamp: now, region: "US" });
  r.record({ userId: "me", productId: "eyeshadow-palette-nude", type: "cart", timestamp: now });
  r.record({ userId: "me", productId: "matte-liquid-lipstick", type: "purchase", timestamp: now });
  const recs = r.forUser("me", 6);
  assert.ok(recs.every((rec) => rec.product.id !== "matte-liquid-lipstick"));
  assert.equal(recs[0].product.category, "cosmetics");
  assert.match(recs[0].reason, /^Because you/);
});

test("trending() filters by category", () => {
  const recs = seeded().trending(5, { category: "sneakers" });
  assert.ok(recs.length > 0 && recs.every((r) => r.product.category === "sneakers"));
});

test("setProducts() picks up catalogue changes", () => {
  const r = new Recommender(PRODUCTS);
  const extra = { ...PRODUCTS[0], id: "ladies-ankle-boots-2", name: "Ladies Ankle Boots II" };
  r.setProducts([...PRODUCTS, extra]);
  assert.ok(r.similar("ladies-high-ankle-boots", 50).some((rec) => rec.product.id === extra.id));
});

type App = Awaited<ReturnType<typeof createApp>>;
const newApp = async (options: Partial<Parameters<typeof createApp>[0]> = {}) =>
  createApp({ db: await connectPglite(), ...options });

function client(app: App) {
  const call = (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) =>
    app.handle(
      new Request(`http://localhost${path}`, {
        method,
        headers: body === undefined ? headers : { "Content-Type": "application/json", ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    );
  return {
    get: (path: string, headers?: Record<string, string>) => call("GET", path, undefined, headers),
    post: (path: string, body: unknown, headers?: Record<string, string>) => call("POST", path, body, headers),
    call,
  };
}

test("HTTP API: products, recommendations and events", async () => {
  const { get, post } = client(await newApp());

  // No category means every category (regression: a missing enum query param defaulted to "women").
  const everything = await (await get("/products?limit=100")).json();
  assert.equal(everything.total, PRODUCTS.length);

  const list = await (await get("/products?category=men&limit=3")).json();
  assert.equal(list.items.length, 3);
  assert.ok(list.total >= 3);

  assert.equal((await get("/products/nope")).status, 404);
  assert.equal((await get("/products?category=pets")).status, 422);

  const similar = await (await get("/recommendations/similar/volume-mascara?limit=4")).json();
  assert.equal(similar.length, 4);

  const basket = await (await post("/recommendations/basket", { productIds: ["volume-mascara"] })).json();
  assert.ok(basket.length > 0);

  const ok = await post("/events", { userId: "abc", type: "cart", productIds: ["volume-mascara"] });
  assert.equal(ok.status, 200);
  const bad = await post("/events", { userId: "abc", type: "cart", productIds: ["nope"] });
  assert.equal(bad.status, 400);

  const user = await (await get("/recommendations/user/abc?limit=3")).json();
  assert.equal(user.length, 3);
});

test("HTTP API: CDN geo header beats the client's region hint", async () => {
  const { get } = client(await newApp());
  const recs = await (
    await get("/recommendations/trending?limit=1&region=US", { "cf-ipcountry": "NG" })
  ).json();
  assert.equal(recs[0].reason, "Popular in Nigeria");
});

test("HTTP API: admin product management", async () => {
  const { get, post, call } = client(await newApp({ adminToken: "secret", seed: false }));
  const auth = { Authorization: "Bearer secret" };
  const product = {
    name: "Ladies High Ankle Boots",
    category: "women",
    price: 199,
    image: "/images/boots.svg",
    description: "New season",
    tags: ["boots"],
    colors: ["black"],
    sizes: ["39"],
  };

  assert.equal((await post("/admin/products", product)).status, 401);
  assert.equal((await post("/admin/products", product, { Authorization: "Bearer nope" })).status, 401);
  assert.equal((await post("/admin/products", { ...product, image: "javascript:alert(1)" }, auth)).status, 422);

  const created = await (await post("/admin/products", product, auth)).json();
  assert.equal(created.id, "ladies-high-ankle-boots-2"); // slug already taken by the seed catalogue

  const similar = await (await get(`/recommendations/similar/${created.id}?limit=1`)).json();
  assert.equal(similar.length, 1);

  const patched = await (await call("PATCH", `/admin/products/${created.id}`, { price: 150 }, auth)).json();
  assert.equal(patched.price, 150);

  assert.equal((await call("DELETE", `/admin/products/${created.id}`, undefined, auth)).status, 200);
  assert.equal((await get(`/products/${created.id}`)).status, 404);

  const stats = await (await get("/admin/stats", auth)).json();
  assert.equal(typeof stats.events, "number");

  const exported = await get("/admin/model/export?neighbours=5", auth);
  assert.match(exported.headers.get("content-disposition") ?? "", /attachment/);
  const snapshot = await exported.json();
  assert.equal(snapshot.format, "shop-recommender-snapshot");
  assert.equal(snapshot.products.length, PRODUCTS.length);
  assert.ok(snapshot.products[0].neighbours.length <= 5);
});

test("HTTP API: admin routes are disabled without a token configured", async () => {
  const { get } = client(await newApp());
  assert.equal((await get("/admin/stats", { Authorization: "Bearer " })).status, 503);
});

test("in-session activity outweighs older history", () => {
  const DAY = 24 * 60 * 60 * 1000;
  const r = new Recommender(PRODUCTS);
  // Long-standing sneaker fan...
  for (const id of ["air-runner-sneakers", "trail-running-shoes", "basketball-mid-sneakers"]) {
    r.record({ userId: "me", productId: id, type: "view", timestamp: now - 5 * DAY });
  }
  // ...who is browsing make-up right now.
  r.record({ userId: "me", productId: "volume-mascara", type: "view", timestamp: now });
  r.record({ userId: "me", productId: "matte-liquid-lipstick", type: "view", timestamp: now });

  const recs = r.forUser("me", 3);
  assert.equal(recs[0].product.category, "cosmetics");
});
