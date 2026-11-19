import OrdersOverview from "@/components/tables/orders-overview";
import React from "react";

const OrdersPage = () => {
  return (
    <div className="w-full flex bg-black py-5 pr-5 min-h-screen">
      <div className="ml-[250px] bg-[#151419]  w-full p-5 flex flex-col">
        <div className="px-10 py-10">
          <h2 className="text-light text-3xl font-semibold">Orders Overview</h2>
        </div>
        <div className="w-full pl-10">
          <OrdersOverview />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
