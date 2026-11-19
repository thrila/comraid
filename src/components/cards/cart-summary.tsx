"use client";
import React from "react";
import { Button } from "../button/button";
import { useAppSelector } from "@/lib/hooks";
import { selectCartSubtotal } from "@/lib/slice/cartSlice";

const CartSummary = () => {
  const subtotal = useAppSelector(selectCartSubtotal);
  return (
    <div className="w-full flex flex-col gap-5 shadow-ash shadow py-5 ">
      <div className="border-b border-light-grey px-5 pb-3">
        <p className="text-2xl font-bold text-black">Cart Summary</p>
      </div>
      <div className="w-full gap-10 flex flex-col items-center px-5">
        <div className="w-full flex justify-between items-center">
          <p className="font-bold text-lg text-ash">Subtotal</p>
          <p className="text-lg text-black">${subtotal.toLocaleString()}</p>
        </div>
        <Button size={"default"} href="/checkout/place-order">
          Proceed to CheckOut
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;
