import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { z } from "zod";
import { API_URL } from "./base";
import { signUpSchema } from "@/lib/form-schema";
import { LoginFormFields } from "@/components/forms/login-form";

type SignUpFields = Omit<z.infer<typeof signUpSchema>, "reEnterPassword">;

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_seller: boolean;
}

export interface Address {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  additional_phone?: string;
  state?: string;
  city: string;
  address: string;
  additional_information?: string;
  is_default: boolean;
}
export type AddressInput = Omit<Address, "id" | "is_default"> & { is_default?: boolean };

/** Accounts and addresses on the Elysia API. Sessions live in an httpOnly cookie. */
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL, credentials: "include" }),
  tagTypes: ["Me", "Addresses"],
  endpoints: (builder) => ({
    me: builder.query<User, void>({
      query: () => "auth/me",
      providesTags: ["Me"],
    }),
    register: builder.mutation<{ email: string; message: string }, SignUpFields>({
      query: (body) => ({ url: "auth/register", method: "POST", body }),
    }),
    verify: builder.mutation<User, { email: string; otp: string }>({
      query: (body) => ({ url: "auth/verify-otp", method: "POST", body }),
      invalidatesTags: ["Me", "Addresses"],
    }),
    resendOtp: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "auth/resend-otp", method: "POST", body }),
    }),
    login: builder.mutation<User, LoginFormFields>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
      invalidatesTags: ["Me", "Addresses"],
    }),
    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "auth/logout", method: "POST" }),
      invalidatesTags: ["Me", "Addresses"],
    }),

    addresses: builder.query<Address[], void>({
      query: () => "addresses",
      providesTags: ["Addresses"],
    }),
    addAddress: builder.mutation<Address, AddressInput>({
      query: (body) => ({ url: "addresses", method: "POST", body }),
      invalidatesTags: ["Addresses"],
    }),
    updateAddress: builder.mutation<Address, { id: string; changes: Partial<AddressInput> }>({
      query: ({ id, changes }) => ({
        url: `addresses/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: changes,
      }),
      invalidatesTags: ["Addresses"],
    }),
    deleteAddress: builder.mutation<{ deleted: string }, string>({
      query: (id) => ({ url: `addresses/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: ["Addresses"],
    }),
  }),
});

export const {
  useMeQuery,
  useRegisterMutation,
  useVerifyMutation,
  useResendOtpMutation,
  useLoginMutation,
  useLogoutMutation,
  useAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = authApi;
