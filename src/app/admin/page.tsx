"use client";
import AdminSideBar from "@/components/sidebar/admin";
import { useState } from "react";
import { AdminPages } from "@/types";
import BuyersSection from "./buyers-page";
import VendorSection from "./vendor-page";
import OrderTracking from "./order-tracking";
import ProductsSection from "./products-page";

const AdminPage = () => {
  const [choosePage, setPage] = useState(AdminPages.Buyers);

  return (
    <div className="w-full flex bg-black">
      {/* Unscrollable SideBar */}
      <div className="fixed">
        <AdminSideBar active={choosePage} name={(page) => setPage(page)} />
      </div>
      <div className="w-full mr-5 my-5 ">
        {choosePage === AdminPages.Buyers && <BuyersSection />}
        {choosePage === AdminPages.Vendors && <VendorSection />}
        {choosePage === AdminPages.OrderTracking && <OrderTracking />}
        {choosePage === AdminPages.Products && <ProductsSection />}
      </div>
    </div>
  );
};

export default AdminPage;
