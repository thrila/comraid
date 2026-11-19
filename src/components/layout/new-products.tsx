"use client";
import { useState } from "react";
import ItemCard from "../cards/item-card";
import { ItemCardSkeleton } from "./product-rail";
import { useGetProductsQuery } from "@/lib/api/catalog";
import type { ProductCategory } from "@/types";

const TABS: { label: string; category?: ProductCategory }[] = [
  { label: "All" },
  { label: "Women", category: "women" },
  { label: "Men", category: "men" },
  { label: "Cosmetics", category: "cosmetics" },
  { label: "Sneakers", category: "sneakers" },
];

const NewProducts = () => {
  const [active, setActive] = useState(0);
  const { data, isLoading, isError } = useGetProductsQuery({
    category: TABS[active].category,
    sort: "newest",
    limit: 8,
  });

  return (
    <div className="w-full justify-center items-center flex flex-col md:container md:mx-auto md:px-10 px-5">
      <div className="flex flex-col items-center justify-center gap-5">
        <h2 className=" font-black md:text-4xl text-2xl">New Products</h2>
        <ul className="list-none flex md:gap-5 gap-2">
          {TABS.map((tab, i) => (
            <li key={tab.label} className="relative group">
              <button
                onClick={() => setActive(i)}
                className={`text-md ${i === active ? "text-black" : "text-ash"}`}
              >
                {tab.label}
              </button>
              <span
                className={`absolute left-0 bottom-0 h-[2px] w-full bg-red transition-transform duration-300 origin-left ${i === active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
              ></span>
            </li>
          ))}
        </ul>
      </div>
      {isError ? (
        <p className="text-ash py-10">Products are unavailable right now.</p>
      ) : (
        <div className="grid md:grid-cols-4 grid-cols-2 w-full py-5 gap-5">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <ItemCardSkeleton key={i} />)
            : data?.items.map((product) => <ItemCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
};

export default NewProducts;
