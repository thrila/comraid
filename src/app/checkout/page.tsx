"use client";
import React from "react";
import EmptyCart from "./empty-cart";
import YouMayAlsoLikeSection from "./you-may-also-like";
import MoreItems from "./more-items";
import CartSummary from "@/components/cards/cart-summary";
import CartList from "./cart-list";
import { useAppSelector } from "@/lib/hooks";
import { selectCartItems } from "@/lib/slice/cartSlice";

const CheckoutPage = () => {
  const items = useAppSelector(selectCartItems);
  const productIds = items.map((item) => item.product.id);

  return (
    <div className="w-full md:px-10 px-5 flex flex-col gap-5 pt-8 pb-10">
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="w-full flex flex-col md:flex-row gap-5">
          <div className="md:w-2/3">
            <CartList />
          </div>
          <div className="md:w-1/3">
            <CartSummary />
          </div>
        </div>
      )}
      <div className="w-full flex flex-col gap-10">
        <YouMayAlsoLikeSection productIds={productIds} />
        <MoreItems excludeIds={productIds} />
      </div>
    </div>
  );
};

export default CheckoutPage;
