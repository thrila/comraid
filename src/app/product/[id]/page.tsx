"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { Button } from "@/components/button/button";
import ReviewStars from "@/components/review-stars";
import ProductRail from "@/components/layout/product-rail";
import { ChevronRIghtIcon } from "@/components/svgs";
import {
  useGetProductQuery,
  useGetSimilarQuery,
  useGetUserRecommendationsQuery,
} from "@/lib/api/catalog";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/slice/cartSlice";
import { useShopper, useTrackInteraction } from "@/lib/shopper";

const ProductPage = ({ params }: { params: { id: string } }) => {
  const id = decodeURIComponent(params.id);
  const dispatch = useAppDispatch();
  const track = useTrackInteraction();
  const shopper = useShopper();
  const [size, setSize] = useState<string>();

  const { data: product, isLoading, isError } = useGetProductQuery(id);
  const similar = useGetSimilarQuery({ id, limit: 8 });
  const forYou = useGetUserRecommendationsQuery(
    { userId: shopper?.id ?? "", region: shopper?.region, limit: 8, exclude: [id] },
    { skip: !shopper },
  );

  // Record the view once per product, as soon as we know who the shopper is.
  useEffect(() => {
    if (product) track("view", [product.id]);
  }, [product, track]);

  if (isLoading) {
    return <div className="min-h-[60vh] pt-10 px-10 text-ash">Loading…</div>;
  }
  if (isError || !product) {
    return (
      <div className="min-h-[60vh] pt-10 px-10 flex flex-col gap-5 items-start">
        <p className="text-2xl font-bold">Product not found</p>
        <Button href="/shop">BACK TO SHOP</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    track("cart", [product.id]);
    toast.success(`${product.name} added to cart`, { autoClose: 2000 });
  };

  return (
    <div className="w-full bg-light pt-8 md:px-10 px-5 flex flex-col gap-10 pb-10">
      <p className="flex items-center capitalize">
        <Link href="/">Home</Link> <ChevronRIghtIcon />
        <Link href={`/shop/${product.category}`}>{product.category}</Link> <ChevronRIghtIcon />
        <span className="text-ash">{product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2 bg-light-grey">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-[400px] md:h-[550px] object-cover"
            priority
          />
        </div>
        <div className="md:w-1/2 flex flex-col gap-5">
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-3">
            <ReviewStars num={Math.round(product.rating)} color="text-red" />
            <span className="text-ash text-sm">{product.rating.toFixed(1)}</span>
          </div>
          <p className="text-3xl font-bold">${product.price}</p>
          <p className="text-ash">{product.description}</p>

          {product.colors.length > 0 && (
            <p className="text-ash capitalize">Colours: {product.colors.join(", ")}</p>
          )}
          {product.sizes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`border px-3 py-1 ${size === s ? "bg-black text-light border-black" : "border-ash"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-5">
            <Button size={"card"} onClick={handleAddToCart}>
              ADD TO CART
            </Button>
            <Button size={"card"} variant={"outline"} href="/checkout">
              VIEW CART
            </Button>
          </div>
        </div>
      </div>

      <ProductRail
        title="Similar Items"
        recommendations={similar.data}
        isLoading={similar.isLoading}
        isError={similar.isError}
        showReasons
      />
      <ProductRail
        title="Picked For You"
        recommendations={forYou.data}
        isLoading={!shopper || forYou.isLoading}
        isError={forYou.isError}
        showReasons
      />
    </div>
  );
};

export default ProductPage;
