"use client";
import React from "react";
import ItemCard from "../cards/item-card";
import { ItemCardSkeleton } from "./product-rail";
import { LIVE_REFRESH_MS, useGetUserRecommendationsQuery } from "@/lib/api/catalog";
import { useShopper } from "@/lib/shopper";
import { useAppSelector } from "@/lib/hooks";
import { selectCartItems } from "@/lib/slice/cartSlice";

interface ForYouProps {
  limit?: number;
}

/**
 * Personalised "For You" feed. New shoppers see what is popular in their region; as they
 * view, add to cart and buy, the feed shifts towards their own taste. Refetches
 * automatically after every tracked interaction.
 */
const ForYou = ({ limit = 8 }: ForYouProps) => {
  const shopper = useShopper();
  const cartIds = useAppSelector(selectCartItems).map((item) => item.product.id);
  const { data, isLoading, isFetching, isError } = useGetUserRecommendationsQuery(
    { userId: shopper?.id ?? "", region: shopper?.region, limit, exclude: cartIds },
    { skip: !shopper, pollingInterval: LIVE_REFRESH_MS },
  );

  const personalised = data?.some((rec) => rec.reason.startsWith("Because you")) ?? false;
  const regional = data?.find((rec) => rec.reason.startsWith("Popular in"))?.reason;
  const showSkeleton = !shopper || isLoading;

  return (
    <section className="w-full flex flex-col items-center gap-5 md:container md:mx-auto md:px-10 px-5 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-black md:text-4xl text-2xl">For You</h2>
        <p className="text-ash text-md">
          {personalised
            ? "Picked for you based on what you've been browsing"
            : `${regional ?? "Popular right now"}. Browse a few items and this feed will adapt to you`}
        </p>
      </div>
      {isError ? (
        <p className="text-ash py-5">Your recommendations are unavailable right now.</p>
      ) : (
        <div
          className={`grid md:grid-cols-4 grid-cols-2 w-full py-5 gap-5 transition-opacity ${isFetching && !showSkeleton ? "opacity-60" : ""}`}
        >
          {showSkeleton
            ? Array.from({ length: limit }, (_, i) => <ItemCardSkeleton key={i} />)
            : data?.map((rec) => (
                <ItemCard key={rec.product.id} product={rec.product} reason={rec.reason} />
              ))}
        </div>
      )}
    </section>
  );
};

export default ForYou;
