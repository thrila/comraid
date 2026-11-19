"use client";
import React from "react";
import ProductRail from "@/components/layout/product-rail";
import { useGetUserRecommendationsQuery } from "@/lib/api/catalog";
import { useShopper } from "@/lib/shopper";

/** The shopper's personal feed, minus what's already in the cart. */
const MoreItems = ({ excludeIds }: { excludeIds: string[] }) => {
  const shopper = useShopper();
  const { data, isLoading, isError } = useGetUserRecommendationsQuery(
    { userId: shopper?.id ?? "", region: shopper?.region, limit: 8, exclude: excludeIds },
    { skip: !shopper },
  );
  return (
    <ProductRail
      title="More Items For You"
      recommendations={data}
      isLoading={!shopper || isLoading}
      isError={isError}
    />
  );
};

export default MoreItems;
