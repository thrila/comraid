"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CheckListIcon,
  HomeIcon,
  LogOutIcon,
  ProductManagementIcon,
  ProfileIcon,
  SaleTagIcon,
} from "../svgs";
import Logo from "@/components/logo";
import { useLogoutMutation } from "@/lib/api/auth";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: <HomeIcon /> },
  { href: "/dashboard/product-management", label: "Product Management", icon: <ProductManagementIcon /> },
  { href: "/dashboard/orders", label: "Orders", icon: <CheckListIcon /> },
  { href: "/dashboard/sales", label: "Sales", icon: <SaleTagIcon /> },
  { href: "/dashboard/profile", label: "Profile", icon: <ProfileIcon /> },
];

const DashboardSideBar = () => {
  const path = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-between py-5 w-[250px]">
      <Link href="/" className="ml-10" aria-label="Back to the shop">
        <Logo className="text-3xl text-light" />
      </Link>

      <nav className="flex gap-7 flex-col w-full">
        {LINKS.map((link) => {
          const active = path === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex gap-5 items-center group pl-5 border-l-4 transition-colors duration-300 ${active ? "border-red text-red" : "border-transparent text-light hover:border-red hover:text-red"}`}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="pl-5 flex gap-5 items-center text-light hover:text-red transition-colors duration-300"
      >
        <span className="text-2xl">
          <LogOutIcon />
        </span>
        <span className="text-sm">Logout</span>
      </button>
    </div>
  );
};

export default DashboardSideBar;
