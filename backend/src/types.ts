export const CATEGORIES = ["women", "men", "cosmetics", "sneakers"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  rating: number;
  image: string;
  description: string;
  tags: string[];
  colors: string[];
  sizes: string[];
  /** ISO date, used for "New Products" ordering */
  createdAt: string;
}

export const EVENT_TYPES = ["view", "cart", "purchase"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface InteractionEvent {
  userId: string;
  productId: string;
  type: EventType;
  /** epoch millis */
  timestamp: number;
  /** ISO 3166-1 alpha-2 country code of the shopper, when known */
  region?: string;
}

export interface Recommendation {
  product: Product;
  score: number;
  /** Short human-readable explanation, e.g. "Similar to Ladies High Ankle Boots" */
  reason: string;
}
