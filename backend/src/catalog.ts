import type { Db } from "./db/client";
import type { Category, Product } from "./types";

export type NewProduct = Omit<Product, "id" | "createdAt" | "rating"> & { rating?: number };

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface ProductRow {
  id: string;
  name: string;
  category: Category;
  price: string | number;
  rating: number;
  image: string;
  description: string;
  tags: string[];
  colors: string[];
  sizes: string[];
  created_at: Date | string;
}

const fromRow = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  category: r.category,
  // numeric comes back as a string from postgres.js
  price: Number(r.price),
  rating: Number(r.rating),
  image: r.image,
  description: r.description,
  tags: r.tags,
  colors: r.colors,
  sizes: r.sizes,
  createdAt: new Date(r.created_at).toISOString(),
});

const COLUMNS = "id, name, category, price, rating, image, description, tags, colors, sizes, created_at";
const params = (p: Product) => [
  p.id,
  p.name,
  p.category,
  p.price,
  p.rating,
  p.image,
  p.description,
  JSON.stringify(p.tags),
  JSON.stringify(p.colors),
  JSON.stringify(p.sizes),
  p.createdAt,
];

/**
 * The product catalogue. Postgres is the source of truth; an in-memory copy serves reads
 * (and feeds the recommender), and every change is written to the database first.
 */
export class Catalog {
  private products: Product[] = [];
  private byId = new Map<string, Product>();
  private listeners: ((products: Product[]) => void)[] = [];

  private constructor(private readonly db: Db) {}

  /** Loads the catalogue, inserting `seed` when the table is empty (first boot). */
  static async load(db: Db, seed: Product[]) {
    const catalog = new Catalog(db);
    let rows = await db.query<ProductRow>(`SELECT ${COLUMNS} FROM products`);
    if (rows.length === 0 && seed.length > 0) {
      await db.transaction(async (tx) => {
        for (const p of seed) {
          await tx.query(
            `INSERT INTO products (${COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11)
             ON CONFLICT (id) DO NOTHING`,
            params(p),
          );
        }
      });
      rows = await db.query<ProductRow>(`SELECT ${COLUMNS} FROM products`);
    }
    catalog.set(rows.map(fromRow));
    return catalog;
  }

  all() {
    return this.products;
  }

  get(id: string) {
    return this.byId.get(id);
  }

  onChange(listener: (products: Product[]) => void) {
    this.listeners.push(listener);
  }

  async add(input: NewProduct): Promise<Product> {
    const base = slugify(input.name) || "product";
    let id = base;
    for (let n = 2; this.byId.has(id); n++) id = `${base}-${n}`;

    const product: Product = {
      ...input,
      id,
      rating: input.rating ?? 0,
      createdAt: new Date().toISOString(),
    };
    await this.db.query(
      `INSERT INTO products (${COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11)`,
      params(product),
    );
    this.set([...this.products, product]);
    return product;
  }

  async update(id: string, changes: Partial<NewProduct>): Promise<Product | undefined> {
    const existing = this.byId.get(id);
    if (!existing) return undefined;
    const updated: Product = { ...existing, ...changes, id, createdAt: existing.createdAt };
    await this.db.query(
      `UPDATE products SET name = $2, category = $3, price = $4, rating = $5, image = $6,
         description = $7, tags = $8::jsonb, colors = $9::jsonb, sizes = $10::jsonb
       WHERE id = $1`,
      params(updated).slice(0, 10),
    );
    this.set(this.products.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    if (!this.byId.has(id)) return false;
    await this.db.query("DELETE FROM products WHERE id = $1", [id]);
    this.set(this.products.filter((p) => p.id !== id));
    return true;
  }

  private set(next: Product[]) {
    this.products = next;
    this.byId = new Map(next.map((p) => [p.id, p]));
    for (const listener of this.listeners) listener(next);
  }
}
