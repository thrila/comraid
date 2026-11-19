"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ItemCard from "../cards/item-card";
import ShopCheck from "../checkbox/shop-check";
import Search from "../forms/search";
import FirstSlider from "../slider/first-slider";
import { ItemCardSkeleton } from "../layout/product-rail";
import { ChevronRIghtIcon } from "../svgs";
import { useGetProductsQuery, type ProductQuery } from "@/lib/api/catalog";
import type { ProductCategory } from "@/types";

const CATEGORIES: { label: string; value?: ProductCategory }[] = [
  { label: "All" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Cosmetics", value: "cosmetics" },
  { label: "Sneakers", value: "sneakers" },
];
const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["white", "black", "blue", "red", "pink", "green", "beige"];
const PRICE_MIN = 0;
const PRICE_MAX = 600;

function toggle(list: string[], value: string, on: boolean) {
  return on ? [...list, value] : list.filter((v) => v !== value);
}

interface ShopBrowserProps {
  initialCategory?: ProductCategory;
  initialQuery?: string;
}

const ShopBrowser = ({ initialCategory, initialQuery = "" }: ShopBrowserProps) => {
  const [category, setCategory] = useState(initialCategory);
  const [q, setQ] = useState(initialQuery);
  const [price, setPrice] = useState([PRICE_MIN, PRICE_MAX]);
  const [debouncedPrice, setDebouncedPrice] = useState(price);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sort, setSort] = useState<NonNullable<ProductQuery["sort"]>>("newest");

  // The slider fires on every pixel of drag; only query once it settles.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPrice(price), 300);
    return () => clearTimeout(timer);
  }, [price]);

  const { data, isFetching, isLoading, isError } = useGetProductsQuery({
    category,
    q,
    minPrice: debouncedPrice[0] > PRICE_MIN ? debouncedPrice[0] : undefined,
    maxPrice: debouncedPrice[1] < PRICE_MAX ? debouncedPrice[1] : undefined,
    sizes,
    colors,
    sort,
    limit: 48,
  });

  const categoryLabel = category && CATEGORIES.find((c) => c.value === category)?.label;

  return (
    <div className="w-full bg-light">
      <div className="md:px-10 px-5 flex flex-col">
        <div className="py-10 flex justify-center">
          <Search defaultValue={initialQuery} onSearch={setQ} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center">
            <Link href="/">Home</Link> <ChevronRIghtIcon />
            {categoryLabel ? (
              <>
                <button onClick={() => setCategory(undefined)}>Shop</button> <ChevronRIghtIcon />
                <span className="text-ash">{categoryLabel}</span>
              </>
            ) : (
              <span className="text-ash">Shop</span>
            )}
          </p>
          <label className="flex items-center gap-2 text-sm">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="border border-black px-2 py-1 bg-light"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
        </div>
        <div className="w-full flex flex-col md:flex-row">
          <aside className="md:w-[200px] w-full md:pr-5 grid grid-cols-2 md:block gap-x-5">
            <div className="flex flex-col gap-2 text-md py-5">
              <h4 className="text-black font-semibold text-xl">Categories</h4>
              {CATEGORIES.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setCategory(c.value)}
                  className={`text-left ${c.value === category ? "text-red font-semibold" : "hover:text-red"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 text-md py-5">
              <h4 className="text-black font-semibold text-xl">Shop by Price</h4>
              <FirstSlider min={PRICE_MIN} max={PRICE_MAX} values={price} onChange={setPrice} />
            </div>
            <div className="flex flex-col gap-1 text-md py-5">
              <h4 className="text-black font-semibold text-xl">Shop by Size</h4>
              {SIZES.map((size) => (
                <ShopCheck
                  key={size}
                  name={size}
                  checked={sizes.includes(size)}
                  onChange={(on) => setSizes((s) => toggle(s, size, on))}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1 text-md py-5">
              <h4 className="text-black font-semibold text-xl">Shop by Color</h4>
              {COLORS.map((color) => (
                <ShopCheck
                  key={color}
                  name={color}
                  checked={colors.includes(color)}
                  onChange={(on) => setColors((c) => toggle(c, color, on))}
                />
              ))}
            </div>
          </aside>
          <div className="w-full flex flex-col gap-3 md:px-10 py-5">
            {data && (
              <p className="text-sm text-ash">
                {data.total} {data.total === 1 ? "item" : "items"}
                {q && ` for "${q}"`}
              </p>
            )}
            {isError ? (
              <p className="text-ash py-10">Products are unavailable right now.</p>
            ) : data && data.items.length === 0 ? (
              <p className="text-ash py-10">No items match these filters.</p>
            ) : (
              <div
                className={`grid md:grid-cols-3 grid-cols-2 gap-5 transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}
              >
                {isLoading
                  ? Array.from({ length: 6 }, (_, i) => <ItemCardSkeleton key={i} />)
                  : data?.items.map((product) => <ItemCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopBrowser;
