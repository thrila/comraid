/** Base URL of the Elysia API (catalogue, recommendations, accounts, admin). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Pulls the API's error message out of an RTK Query error. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong") {
  const data = (error as { data?: unknown })?.data;
  if (data && typeof data === "object") {
    const d = data as { error?: string; message?: string; summary?: string };
    return d.error ?? d.summary ?? d.message ?? fallback;
  }
  if (typeof data === "string") return data;
  return fallback;
}
