import type { Product } from "../types";

/** How much each kind of attribute counts towards "these look alike". */
const FIELD_WEIGHTS = {
  category: 2,
  tag: 1,
  color: 0.5,
  price: 0.75,
};

const PRICE_BUCKETS = [50, 100, 200, 350];

function priceBucket(price: number) {
  const idx = PRICE_BUCKETS.findIndex((limit) => price < limit);
  return idx === -1 ? PRICE_BUCKETS.length : idx;
}

function featuresOf(p: Product): [token: string, fieldWeight: number][] {
  return [
    [`cat:${p.category}`, FIELD_WEIGHTS.category],
    ...p.tags.map((t): [string, number] => [`tag:${t}`, FIELD_WEIGHTS.tag]),
    ...p.colors.map((c): [string, number] => [`color:${c}`, FIELD_WEIGHTS.color]),
    [`price:${priceBucket(p.price)}`, FIELD_WEIGHTS.price],
  ];
}

/**
 * Builds an N×N cosine-similarity matrix from TF-IDF weighted product attributes.
 * Rare attributes (e.g. "basketball") count for more than common ones (e.g. "footwear").
 */
export function buildContentSimilarity(products: Product[]): Float64Array {
  const n = products.length;
  const features = products.map(featuresOf);

  const docFreq = new Map<string, number>();
  for (const f of features) {
    for (const token of new Set(f.map(([t]) => t))) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }

  const vectors = features.map((f) => {
    const vec = new Map<string, number>();
    for (const [token, weight] of f) {
      const idf = Math.log(n / docFreq.get(token)!) + 1;
      vec.set(token, (vec.get(token) ?? 0) + weight * idf);
    }
    const norm = Math.sqrt([...vec.values()].reduce((s, v) => s + v * v, 0)) || 1;
    for (const [k, v] of vec) vec.set(k, v / norm);
    return vec;
  });

  const sim = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let dot = 0;
      for (const [token, v] of vectors[i]) dot += v * (vectors[j].get(token) ?? 0);
      sim[i * n + j] = dot;
      sim[j * n + i] = dot;
    }
  }
  return sim;
}
