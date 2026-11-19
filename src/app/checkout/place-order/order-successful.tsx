import { Button } from "@/components/button/button";
import { CheckIcon } from "@/components/svgs";
import React from "react";

const OrderSuccessful = () => {
  return (
    <div className="py-10 flex flex-col justify-center items-center gap-5">
      <div>
        <span>
          <CheckIcon className="text-9xl" />
        </span>
      </div>
      <div className="flex flex-col gap-5 items-center justify-center">
        <h3 className="text-3xl font-bold text-black">Order Successful</h3>
        <p className="text-ash text-lg">Your order has been placed successfully</p>
      </div>
      <div className="">
        <Button variant={"default"} size={"card"} href="/shop">
          CONTINUE SHOPPING
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccessful;
