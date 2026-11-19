"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import ReviewStars from "../review-stars";
import { BinIcon } from "../svgs";
import { useAppDispatch } from "@/lib/hooks";
import { removeFromCart, setQuantity, type CartItem } from "@/lib/slice/cartSlice";

const CheckoutItems = ({ item }: { item: CartItem }) => {
  const dispatch = useAppDispatch();
  const { product, quantity } = item;
  const changeQuantity = (next: number) =>
    dispatch(setQuantity({ id: product.id, quantity: next }));

  return (
    <div className="flex flex-col gap-3 border-b border-light-grey pb-3 last:border-none">
      <div className="flex flex-row gap-5 py-2">
        <Link href={`/product/${product.id}`} className="w-[110px] h-[110px] shrink-0 bg-light-grey">
          <Image
            title={product.name}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            width={200}
            height={200}
          />
        </Link>
        <div className="flex flex-col gap-1">
          <Link href={`/product/${product.id}`} className="text-ash text-xl hover:text-black">
            {product.name}
          </Link>
          <p className="text-black text-xl font-semibold">${product.price}</p>
          <ReviewStars num={Math.round(product.rating)} color="text-red" />
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => dispatch(removeFromCart(product.id))}
          className="text-lg py-1 bg-black text-light px-4 inline-flex gap-2 items-center"
        >
          <BinIcon className="text-light text-xl" />
          Remove
        </button>
        <div className="flex gap-5 justify-between items-center">
          <button
            onClick={() => changeQuantity(quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="border border-black w-[40px] h-[40px] flex items-center justify-center hover:text-light-grey hover:bg-ash hover:border-none ease-in duration-500 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="text-2xl font-bold">-</span>
          </button>
          <p className="text-xl font-bold">{quantity}</p>
          <button
            onClick={() => changeQuantity(quantity + 1)}
            aria-label="Increase quantity"
            className="border border-black w-[40px] h-[40px] flex items-center justify-center hover:text-light-grey hover:bg-ash hover:border-none ease-in duration-500"
          >
            <span className="text-2xl font-bold">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutItems;
