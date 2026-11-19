import type { Metadata } from "next";
import CheckOutHeader from "@/components/header/checkout-header";

export const metadata: Metadata = {
  title: "Shop | Checkout",
  description: "Sleek, Trendy & Unique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <CheckOutHeader />
      </header>
      {children}
    </>
  );
}
