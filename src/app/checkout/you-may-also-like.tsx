"use client";
import React from "react";
import ProductRail from "@/components/layout/product-rail";
import { useGetBasketRecommendationsQuery } from "@/lib/api/catalog";
import { useShopper } from "@/lib/shopper";

/** Complements for what's in the cart ("goes well with ..."). */
const YouMayAlsoLikeSection = ({ productIds }: { productIds: string[] }) => {
  const shopper = useShopper();
  const { data, isLoading, isError } = useGetBasketRecommendationsQuery(
    { productIds, limit: 8, region: shopper?.region },
    { skip: !shopper },
  );
  return (
    <ProductRail
      title="You May Also Like"
      recommendations={data}
      isLoading={!shopper || isLoading}
      isError={isError}
      showReasons
    />
  );
};

export default YouMayAlsoLikeSection;
