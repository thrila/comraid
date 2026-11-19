"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "../svgs";
import { Button } from "../button/button";

interface SearchProps {
  defaultValue?: string;
  /** Defaults to navigating to the shop with `?q=` */
  onSearch?: (query: string) => void;
}

const Search = ({ defaultValue = "", onSearch }: SearchProps) => {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (onSearch) onSearch(query);
    else router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="w-3/4 h-[60px] flex flex-row bg-ash/10">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search Item"
        aria-label="Search items"
        className="w-full placeholder:italic px-5 text-xl bg-ash/5 focus:outline-none focus:ring-0 border-none"
      />
      <Button variant={"ghost"} size={"icon"} className="w-16 h-full" type="submit" aria-label="Search">
        <SearchIcon className="text-black text-3xl opacity-100" />
      </Button>
    </form>
  );
};

export default Search;
