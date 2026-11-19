import React from "react";
import {
  BuyersIcon,
  OrderTrackingIcon,
  ProductManagementIcon,
  VendorsIcon,
} from "../svgs";
import { AdminPages } from "@/types";
import Logo from "@/components/logo";

interface AdminSideBarProps {
  active: AdminPages;
  name: (page: AdminPages) => void;
}

const ITEMS = [
  { page: AdminPages.Buyers, label: "Buyers", icon: <BuyersIcon /> },
  { page: AdminPages.Vendors, label: "Vendors", icon: <VendorsIcon /> },
  { page: AdminPages.OrderTracking, label: "Order tracking", icon: <OrderTrackingIcon /> },
  { page: AdminPages.Products, label: "Products", icon: <ProductManagementIcon /> },
];

const AdminSideBar = ({ active, name }: AdminSideBarProps) => {
  return (
    <div className="min-h-screen bg-black flex flex-col gap-10 py-5 w-[250px]">
      <div className="ml-10">
        <Logo className="text-3xl text-light" />
      </div>

      <nav className="flex gap-7 flex-col w-full">
        {ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => name(item.page)}
            aria-current={active === item.page ? "page" : undefined}
            className={`flex gap-5 items-center pl-5 border-l-4 text-left transition-colors duration-300 ${active === item.page ? "border-red text-red" : "border-transparent text-ash hover:border-red hover:text-red"}`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminSideBar;
