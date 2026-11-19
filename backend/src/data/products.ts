import { readFileSync } from "node:fs";
import { slugify } from "../catalog";
import type { Category, Product } from "../types";

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];

type Seed = [
  name: string,
  price: number,
  rating: number,
  tags: string[],
  colors: string[],
];

const SEEDS: Record<Category, Seed[]> = {
  women: [
    ["Ladies Denim Trousers", 345, 4.5, ["denim", "trousers", "casual"], ["blue"]],
    ["Ladies High Ankle Boots", 289, 4.7, ["boots", "leather", "footwear", "winter"], ["black", "brown"]],
    ["Floral Summer Dress", 159, 4.3, ["dress", "floral", "summer"], ["white", "pink"]],
    ["Pleated Midi Skirt", 129, 4.1, ["skirt", "pleated", "office"], ["black", "beige"]],
    ["Oversized Knit Sweater", 189, 4.6, ["knitwear", "sweater", "winter", "casual"], ["beige", "white"]],
    ["Silk Button Blouse", 175, 4.4, ["blouse", "silk", "office"], ["white", "pink"]],
    ["Ladies Leather Jacket", 420, 4.8, ["jacket", "leather", "outerwear"], ["black"]],
    ["High Waist Wide-Leg Jeans", 210, 4.2, ["denim", "jeans", "casual"], ["blue", "black"]],
    ["Ladies Chelsea Boots", 260, 4.4, ["boots", "leather", "footwear"], ["black"]],
    ["Linen Summer Shorts", 89, 4.0, ["shorts", "linen", "summer"], ["white", "beige"]],
    ["Wrap Evening Gown", 510, 4.9, ["dress", "evening", "formal"], ["red", "black"]],
    ["Ribbed Crop Top", 59, 3.9, ["top", "casual", "summer"], ["white", "black", "pink"]],
  ],
  men: [
    ["Men's Slim Fit Chinos", 149, 4.3, ["chinos", "trousers", "office"], ["beige", "black"]],
    ["Classic Oxford Shirt", 119, 4.5, ["shirt", "cotton", "office"], ["white", "blue"]],
    ["Men's Denim Jacket", 230, 4.6, ["denim", "jacket", "outerwear", "casual"], ["blue"]],
    ["Relaxed Fit Hoodie", 99, 4.2, ["hoodie", "streetwear", "casual"], ["black", "green"]],
    ["Tailored Wool Blazer", 450, 4.8, ["blazer", "wool", "formal"], ["black", "blue"]],
    ["Cargo Joggers", 109, 4.1, ["joggers", "streetwear", "casual"], ["green", "black"]],
    ["Graphic Cotton Tee", 49, 4.0, ["t-shirt", "cotton", "streetwear", "summer"], ["white", "black"]],
    ["Men's Straight Leg Jeans", 179, 4.4, ["denim", "jeans", "casual"], ["blue"]],
    ["Linen Short Sleeve Shirt", 95, 4.2, ["shirt", "linen", "summer"], ["white", "beige"]],
    ["Quilted Puffer Jacket", 360, 4.7, ["jacket", "outerwear", "winter"], ["black", "green"]],
  ],
  sneakers: [
    ["Air Runner Sneakers", 220, 4.6, ["running", "sport", "footwear"], ["white", "red"]],
    ["Retro High-Top Sneakers", 199, 4.5, ["high-top", "streetwear", "footwear"], ["white", "black"]],
    ["Canvas Low-Top Sneakers", 89, 4.2, ["canvas", "casual", "footwear"], ["white", "blue"]],
    ["Chunky Platform Sneakers", 245, 4.3, ["platform", "streetwear", "footwear"], ["white", "pink"]],
    ["Trail Running Shoes", 260, 4.7, ["running", "trail", "sport", "footwear"], ["green", "black"]],
    ["Leather Court Sneakers", 210, 4.4, ["leather", "casual", "footwear"], ["white"]],
    ["Knit Slip-On Trainers", 150, 4.1, ["knit", "sport", "footwear"], ["black", "blue"]],
    ["Basketball Mid Sneakers", 280, 4.8, ["basketball", "sport", "streetwear", "footwear"], ["red", "black"]],
    ["Suede Skate Shoes", 130, 4.2, ["suede", "skate", "streetwear", "footwear"], ["blue", "black"]],
  ],
  cosmetics: [
    ["Matte Liquid Lipstick", 35, 4.4, ["lips", "makeup", "matte"], ["red", "pink"]],
    ["Hydrating Face Serum", 65, 4.7, ["skincare", "serum", "hydrating"], []],
    ["Radiant Foundation", 55, 4.3, ["face", "makeup", "foundation"], ["beige"]],
    ["Volume Mascara", 29, 4.5, ["eyes", "makeup", "mascara"], ["black"]],
    ["Vitamin C Brightening Cream", 72, 4.6, ["skincare", "cream", "brightening"], []],
    ["Eyeshadow Palette Nude", 48, 4.4, ["eyes", "makeup", "palette"], ["beige", "brown"]],
    ["Rose Eau de Parfum", 120, 4.8, ["fragrance", "floral"], ["pink"]],
    ["SPF 50 Daily Sunscreen", 38, 4.5, ["skincare", "sunscreen", "summer"], []],
    ["Gentle Foaming Cleanser", 30, 4.2, ["skincare", "cleanser"], []],
    ["Lip Gloss Trio", 32, 4.1, ["lips", "makeup", "gloss"], ["pink", "red"]],
  ],
};

function sizesFor(category: Category, tags: string[]) {
  if (category === "cosmetics") return [];
  if (category === "sneakers" || tags.includes("footwear")) return SHOE_SIZES;
  return APPAREL_SIZES;
}

// Real photos fetched by `npm run seed:photos` (id -> image path); empty until then.
const PHOTOS: Record<string, string> = JSON.parse(
  readFileSync(new URL("./photos.json", import.meta.url), "utf8"),
);

// Fixed reference date so "newest" ordering is stable between restarts.
const CATALOG_EPOCH = Date.UTC(2026, 9, 1);
const DAY = 24 * 60 * 60 * 1000;

/** Starter catalogue, written to the data dir on first boot; admins manage it from then on. */
export const SEED_PRODUCTS: Product[] = Object.entries(SEEDS).flatMap(([category, seeds]) =>
  seeds.map(([name, price, rating, tags, colors], i): Product => {
    const cat = category as Category;
    const id = slugify(name);
    return {
      id,
      name,
      category: cat,
      price,
      rating,
      // Generated by `npm run seed:images`; replaced by photos via `npm run seed:photos`.
      image: PHOTOS[id] ?? `/images/products/${id}.svg`,
      description: `${name} from our ${cat} collection.`,
      tags,
      colors,
      sizes: sizesFor(cat, tags),
      createdAt: new Date(CATALOG_EPOCH + ((i * 7 + name.length) % 45) * DAY).toISOString(),
    };
  }),
);
