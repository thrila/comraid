/**
 * Replaces the generated demo images with real product photos from Unsplash.
 *
 *   UNSPLASH_ACCESS_KEY=... npm run seed:photos
 *
 * - Uses the official Unsplash API (https://unsplash.com/developers), following its
 *   guidelines: hotlink-free local copies, download tracking, and photographer credits.
 * - Saves photos to ../public/images/products/<id>.jpg, credits to CREDITS.md there, and
 *   the id -> image mapping to src/data/photos.json (read by the seed catalogue).
 * - If the API is running and ADMIN_TOKEN is set, also updates products already in the DB.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { SEED_PRODUCTS } from "../src/data/products";

const KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!KEY) {
  console.error("Set UNSPLASH_ACCESS_KEY (create a free app at https://unsplash.com/developers).");
  process.exit(1);
}

const OUT_DIR = new URL("../../public/images/products/", import.meta.url).pathname;
const MANIFEST = new URL("../src/data/photos.json", import.meta.url).pathname;
const API_URL = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;

interface UnsplashPhoto {
  id: string;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

const unsplash = async <T>(url: string) => {
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" } });
  if (!res.ok) throw new Error(`Unsplash ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
};

const photos: Record<string, string> = JSON.parse(readFileSync(MANIFEST, "utf8"));
const credits: string[] = [];
mkdirSync(OUT_DIR, { recursive: true });

for (const product of SEED_PRODUCTS) {
  const query = encodeURIComponent(`${product.name} product`);
  const { results } = await unsplash<{ results: UnsplashPhoto[] }>(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=portrait&content_filter=high`,
  );
  const photo = results[0];
  if (!photo) {
    console.warn(`No photo found for ${product.name}; keeping the demo image.`);
    continue;
  }

  // Required by the API guidelines whenever a photo is downloaded.
  await unsplash(photo.links.download_location);
  const image = await fetch(`${photo.urls.raw}&w=900&h=1125&fit=crop&fm=jpg&q=78`);
  writeFileSync(`${OUT_DIR}${product.id}.jpg`, Buffer.from(await image.arrayBuffer()));

  photos[product.id] = `/images/products/${product.id}.jpg`;
  credits.push(
    `- **${product.name}**: photo by [${photo.user.name}](${photo.user.links.html}?utm_source=shop&utm_medium=referral) on [Unsplash](${photo.links.html})`,
  );
  console.log(`✓ ${product.name}`);
}

writeFileSync(MANIFEST, JSON.stringify(photos, null, 2) + "\n");
writeFileSync(`${OUT_DIR}CREDITS.md`, `# Product photo credits\n\n${credits.join("\n")}\n`);

// Update products that were already seeded into the database.
if (process.env.ADMIN_TOKEN) {
  for (const [id, image] of Object.entries(photos)) {
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
      body: JSON.stringify({ image }),
    }).catch(() => null);
    if (!res?.ok) {
      console.warn(`Could not update ${id} through ${API_URL} - is the API running?`);
      break;
    }
  }
}
console.log(`Done: ${credits.length} photos. Credits in public/images/products/CREDITS.md`);
