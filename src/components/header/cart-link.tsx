"use client";
import Link from "next/link";
import { CartIcon } from "../svgs";
import { useAppSelector } from "@/lib/hooks";
import { selectCartCount } from "@/lib/slice/cartSlice";

const CartLink = () => {
  const count = useAppSelector(selectCartCount);
  return (
    <Link href={"/checkout"} className="relative" aria-label={`Cart (${count} items)`}>
      <CartIcon className="md:text-3xl text-2xl" />
      {count > 0 && (
        <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red text-light text-[10px] font-bold flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

export default CartLink;
