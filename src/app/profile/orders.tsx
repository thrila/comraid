import { Button } from "@/components/button/button";
import { CartIcon } from "@/components/svgs";
import React from "react";

// Orders aren't stored by the API yet (see README to-dos), so this shows the empty state.
const OrdersPage = () => {
  return (
    <div className="w-full bg-light">
      <div className="flex-col flex">
        <div className="py-5 w-full border-y-[#CCCCCC4D] border-y">
          <h1 className="px-5 md:pl-10 text-2xl">Orders</h1>
        </div>
        <div className="w-full gap-6 flex flex-col pt-10 items-center min-h-[400px] px-5">
          <div className="rounded-full bg-light-grey p-8 flex items-center justify-center">
            <CartIcon className="text-7xl text-red" />
          </div>
          <p className="text-xl font-bold text-center">You have no orders yet</p>
          <Button variant={"default"} size={"card"} href="/shop">
            START SHOPPING
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
