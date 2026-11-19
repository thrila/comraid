export type ReviewProp = {
  num: number;
  color?: string;
};

export enum AdminPages {
  "Buyers",
  "Vendors",
  "OrderTracking",
  "Products",
}

export enum CheckOut {
  "empty",
  "notEmpty",
}
export enum NewProducts {
  "all",
  "women",
  "men",
  "sneakers",
  "cosmetics",
}

export type ProductCategory = "women" | "men" | "cosmetics" | "sneakers";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  rating: number;
  image: string;
  description: string;
  tags: string[];
  colors: string[];
  sizes: string[];
  createdAt: string;
}

export interface Recommendation {
  product: Product;
  score: number;
  reason: string;
}

export type InteractionType = "view" | "cart" | "purchase";
