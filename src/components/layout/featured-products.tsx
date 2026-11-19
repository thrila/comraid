"use client";
import FeaturedCard from "../cards/featured-card";
import { FeaturedData } from "@/lib/UI/home";
import { LIVE_REFRESH_MS, useGetTrendingQuery } from "@/lib/api/catalog";

const CATEGORY_LABELS: Record<string, string> = {
  women: "Women's Latest",
  men: "Men's Latest",
  cosmetics: "Cosmetics",
  sneakers: "Sneakers",
};

const FeaturedProducts = () => {
  const { data } = useGetTrendingQuery({ limit: 4 }, { pollingInterval: LIVE_REFRESH_MS });

  // Fall back to the static design data if the recommender is offline.
  const cards = data
    ? data.map(({ product }) => ({
        key: product.id,
        href: `/product/${product.id}`,
        image: product.image,
        title: product.name,
        category: CATEGORY_LABELS[product.category],
      }))
    : FeaturedData.map((d, i) => ({ key: String(i), href: "/shop", ...d }));

  return (
    <div className="w-full justify-center items-center flex flex-col gap-5 md:px-10 px-5">
      <h3 className="text-3xl md:text-4xl font-black ">FEATURED PRODUCTS</h3>
      <div className="grid md:grid-cols-4 grid-cols-2 w-full py-5 gap-5 gap-y-10">
        {cards.map(({ key, ...card }) => (
          <FeaturedCard key={key} {...card} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
