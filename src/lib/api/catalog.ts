import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "./base";
import type { InteractionType, Product, ProductCategory, Recommendation } from "@/types";

/** How often live recommendation feeds re-poll, so other shoppers' activity shows up. */
export const LIVE_REFRESH_MS = 60_000;

export interface ProductQuery {
  category?: ProductCategory;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  limit?: number;
  offset?: number;
}

// Drops empty values so they don't end up in the query string as "undefined".
function toParams(query: object) {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length > 0) params[key] = value.join(",");
    } else {
      params[key] = value;
    }
  }
  return params;
}

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  // Personalised results depend on what the shopper just did, so tracking refreshes them;
  // catalogue edits from the admin page refresh everything.
  tagTypes: ["Products", "Recommendations", "Personalised"],
  endpoints: (builder) => ({
    getProducts: builder.query<{ items: Product[]; total: number }, ProductQuery>({
      query: (query) => ({ url: "products", params: toParams(query) }),
      providesTags: ["Products"],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `products/${encodeURIComponent(id)}`,
      providesTags: ["Products"],
    }),
    getTrending: builder.query<
      Recommendation[],
      { limit?: number; category?: ProductCategory; region?: string }
    >({
      query: (params) => ({ url: "recommendations/trending", params: toParams(params) }),
      providesTags: ["Recommendations"],
    }),
    getSimilar: builder.query<Recommendation[], { id: string; limit?: number }>({
      query: ({ id, limit }) => ({
        url: `recommendations/similar/${encodeURIComponent(id)}`,
        params: toParams({ limit }),
      }),
      providesTags: ["Recommendations"],
    }),
    getBasketRecommendations: builder.query<
      Recommendation[],
      { productIds: string[]; limit?: number; region?: string }
    >({
      query: (body) => ({ url: "recommendations/basket", method: "POST", body }),
      providesTags: ["Recommendations"],
    }),
    getUserRecommendations: builder.query<
      Recommendation[],
      { userId: string; limit?: number; exclude?: string[]; region?: string }
    >({
      query: ({ userId, ...params }) => ({
        url: `recommendations/user/${encodeURIComponent(userId)}`,
        params: toParams(params),
      }),
      providesTags: ["Recommendations", "Personalised"],
    }),
    trackEvent: builder.mutation<
      { recorded: number },
      { userId: string; type: InteractionType; productIds: string[]; region?: string }
    >({
      query: (body) => ({ url: "events", method: "POST", body }),
      invalidatesTags: ["Personalised"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetTrendingQuery,
  useGetSimilarQuery,
  useGetBasketRecommendationsQuery,
  useGetUserRecommendationsQuery,
  useTrackEventMutation,
} = catalogApi;
