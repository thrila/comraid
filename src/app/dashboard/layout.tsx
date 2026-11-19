import type { Metadata } from "next";
import DashboardSideBar from "@/components/sidebar/dashboard";

export const metadata: Metadata = {
  title: "Shop | Product Management",
  description: "Sleek, Trendy & Unique",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-black min-h-screen">
      {/* Unscrollable SideBar; pages leave a 250px gutter for it */}
      <div className="fixed z-10">
        <DashboardSideBar />
      </div>
      {children}
    </div>
  );
}
