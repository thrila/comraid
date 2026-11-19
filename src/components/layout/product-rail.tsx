"use client";
import React from "react";
import ItemCard from "../cards/item-card";
import { Carousel } from "../carousel/main-carousel";
import type { Recommendation } from "@/types";

interface ProductRailProps {
  title: string;
  recommendations?: Recommendation[];
  isLoading: boolean;
  isError: boolean;
  /** Show the recommender's "why" line on each card */
  showReasons?: boolean;
}

export const ItemCardSkeleton = () => (
  <div className="w-full min-w-[160px] flex flex-col gap-3 animate-pulse">
    <div className="w-full h-[240px] bg-light-grey" />
    <div className="h-4 w-2/3 bg-light-grey" />
    <div className="h-5 w-1/3 bg-light-grey" />
  </div>
);

/** Horizontal carousel of recommended products with loading / error / empty states. */
const ProductRail = ({
  title,
  recommendations,
  isLoading,
  isError,
  showReasons = false,
}: ProductRailProps) => {
  if (!isLoading && !isError && (!recommendations || recommendations.length === 0)) return null;

  return (
    <section className="w-full flex flex-col gap-5">
      <h3 className="text-2xl font-bold">{title}</h3>
      {isError ? (
        <p className="text-ash">Recommendations are unavailable right now.</p>
      ) : (
        <Carousel>
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="shrink-0 basis-1/2 md:basis-1/4">
                  <ItemCardSkeleton />
                </div>
              ))
            : recommendations!.map((rec) => (
                <div key={rec.product.id} className="shrink-0 basis-1/2 md:basis-1/4">
                  <ItemCard product={rec.product} reason={showReasons ? rec.reason : undefined} />
                </div>
              ))}
        </Carousel>
      )}
    </section>
  );
};

export default ProductRail;
