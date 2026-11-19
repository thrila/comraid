import type { Metadata } from "next";
import { helvetica_neue } from "./fonts/font";
import StoreProvider from "./StoreProvider";
import "./globals.css";
import { SiteFooter, SiteHeader, SiteMain } from "@/components/layout/site-chrome";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Shop | Home",
  description: "Sleek, Trendy & Unique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${helvetica_neue.className} ${helvetica_neue.variable}`}>
        <StoreProvider>
          <ToastContainer position="bottom-right" />
          <SiteHeader />
          <SiteMain>{children}</SiteMain>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
