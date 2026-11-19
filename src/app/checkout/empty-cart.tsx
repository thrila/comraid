import { Button } from "@/components/button/button";
import { CartIcon } from "@/components/svgs";
import React from "react";

const EmptyCart = () => {
  return (
    <div className="w-full flex flex-col gap-5 justify-center items-center py-16 mt-10">
      <div className="bg-light-grey rounded-full p-4">
        <CartIcon className="text-7xl text-red" />
      </div>
      <p className="text-ash text-lg">Oops, Your Cart is empty</p>
      <div className="w-full pt-12 flex justify-center">
        <Button variant={"default"} size={"default"} href="/shop">
          GO BACK TO SHOPPING
        </Button>
      </div>
    </div>
  );
};

export default EmptyCart;
