import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Admin",
  description: "Sleek, Trendy & Unique",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
