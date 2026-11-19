import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Login",
  description: "Sleek, Trendy & Unique",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
