"use client";
import CheckoutItems from "@/components/cards/checkout-items";
import { useAppSelector } from "@/lib/hooks";
import { selectCartCount, selectCartItems } from "@/lib/slice/cartSlice";
import React from "react";

const CartList = () => {
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  return (
    <div className=" w-full flex flex-col gap-2  shadow-ash shadow py-5">
      <div className="border-b border-light-grey px-3 pb-2">
        <h2 className="text-2xl font-bold text-black">Cart({count})</h2>
      </div>
      <div className="flex flex-col gap-2 px-5">
        {items.map((item) => (
          <CheckoutItems key={item.product.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CartList;
