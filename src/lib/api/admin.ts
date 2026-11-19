import { API_URL } from "./base";
export { apiErrorMessage } from "./base";
import { catalogApi } from "./catalog";
import type { Product } from "@/types";

export type ProductInput = Omit<Product, "id" | "createdAt" | "rating"> & { rating?: number };

export interface AdminStats {
  products: number;
  events: number;
  shoppers: number;
  regions: { code: string; name: string; events: number }[];
  topProducts: { product: Product; score: number }[];
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

/** Admin endpoints of the API. Every call carries the admin token. */
export const adminApi = catalogApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, string>({
      query: (token) => ({ url: "admin/stats", headers: auth(token) }),
      providesTags: ["Products", "Personalised"],
    }),
    createProduct: builder.mutation<Product, { token: string; product: ProductInput }>({
      query: ({ token, product }) => ({
        url: "admin/products",
        method: "POST",
        headers: auth(token),
        body: product,
      }),
      invalidatesTags: ["Products", "Recommendations"],
    }),
    updateProduct: builder.mutation<
      Product,
      { token: string; id: string; changes: Partial<ProductInput> }
    >({
      query: ({ token, id, changes }) => ({
        url: `admin/products/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: auth(token),
        body: changes,
      }),
      invalidatesTags: ["Products", "Recommendations"],
    }),
    deleteProduct: builder.mutation<{ deleted: string }, { token: string; id: string }>({
      query: ({ token, id }) => ({
        url: `admin/products/${encodeURIComponent(id)}`,
        method: "DELETE",
        headers: auth(token),
      }),
      invalidatesTags: ["Products", "Recommendations"],
    }),
    uploadImage: builder.mutation<{ url: string }, { token: string; file: File }>({
      query: ({ token, file }) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "admin/uploads", method: "POST", headers: auth(token), body };
      },
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useLazyGetAdminStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadImageMutation,
} = adminApi;

/** Downloads a JSON snapshot of the live recommender model (needs the admin token). */
export async function downloadModelSnapshot(token: string) {
  const res = await fetch(`${API_URL}/admin/model/export`, { headers: auth(token) });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Export failed (${res.status})`);
  }
  const name =
    res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "shop-model.json";
  const url = URL.createObjectURL(await res.blob());
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  URL.revokeObjectURL(url);
}
