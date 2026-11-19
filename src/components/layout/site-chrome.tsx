"use client";
import { usePathname } from "next/navigation";
import Header from "../header/header";
import Footer from "../footer/footer";

// These routes render their own header/sidebar (or none at all).
const BARE_ROUTES = [
  "/login",
  "/sign-up",
  "/enter-otp",
  "/forgot-password",
  "/admin",
  "/dashboard",
  "/checkout",
];

const isBare = (path: string) =>
  BARE_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));

// /checkout renders its own (same-height) header, so it still needs the offset.
const hasFixedHeader = (path: string) => !isBare(path) || path.startsWith("/checkout");

/** Main content, pushed below the fixed 64px header where there is one. */
export function SiteMain({ children }: { children: React.ReactNode }) {
  return <main className={hasFixedHeader(usePathname()) ? "pt-16" : undefined}>{children}</main>;
}

export function SiteHeader() {
  return isBare(usePathname()) ? null : (
    <header>
      <Header />
    </header>
  );
}

export function SiteFooter() {
  return isBare(usePathname()) ? null : (
    <footer>
      <Footer />
    </footer>
  );
}
