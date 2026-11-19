"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { Button } from "../button/button";
import { FavouriteIcon } from "../svgs";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/slice/cartSlice";
import { useTrackInteraction } from "@/lib/shopper";
import type { Product } from "@/types";

interface ItemType {
  product: Product;
  /** Optional recommender explanation shown under the price */
  reason?: string;
}

const ItemCard = ({ product, reason }: ItemType) => {
  const dispatch = useAppDispatch();
  const track = useTrackInteraction();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    track("cart", [product.id]);
    toast.success(`${product.name} added to cart`, { autoClose: 2000 });
  };

  return (
    <div className="group w-full min-w-0 flex flex-col">
      <Link
        href={`/product/${product.id}`}
        className="block w-full aspect-[4/5] overflow-hidden bg-light-grey"
      >
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          width={480}
          height={600}
        />
      </Link>
      <div className="w-full flex flex-col gap-3 pt-3">
        <div className="w-full min-h-[64px]">
          <Link
            href={`/product/${product.id}`}
            className="block text-sm md:text-md text-ash hover:text-black truncate"
          >
            {product.name}
          </Link>
          <p className="text-black font-bold text-lg md:text-xl">${product.price}</p>
          {reason && <p className="text-xs text-search italic truncate">{reason}</p>}
        </div>
        <div className="flex flex-row gap-2 w-full">
          <Button
            variant={"item-card"}
            size={"block"}
            className="flex-1 min-w-0 whitespace-nowrap px-1 text-[11px] sm:text-xs md:text-sm"
            onClick={handleAddToCart}
          >
            ADD TO CART
          </Button>
          <Button variant={"item-card"} size={"icon"} className="shrink-0" aria-label="Save item">
            <FavouriteIcon className="text-xl" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
