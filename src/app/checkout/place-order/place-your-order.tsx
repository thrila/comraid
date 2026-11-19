"use client";
import { Button } from "@/components/button/button";
import { ArrowLeftRounded, EditIcon } from "@/components/svgs";
import { useAppSelector } from "@/lib/hooks";
import { selectCartCount, selectCartSubtotal } from "@/lib/slice/cartSlice";
import type { Address } from "@/lib/api/auth";
import Link from "next/link";
import React from "react";
import { formatAddress, formatPhones } from "./select-address";

const DELIVERY_FEE = 30;

interface PlaceYourOrderProps {
  /** Signed-in shopper's chosen delivery address; undefined when there is none yet */
  address?: Address;
  signedIn: boolean;
  onEditAddress: () => void;
  onConfirm: () => void;
}

const PlaceYourOrder = ({ address, signedIn, onEditAddress, onConfirm }: PlaceYourOrderProps) => {
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);

  return (
    <div className="py-10 md:px-10 px-5 flex flex-col gap-5">
      <Link
        href="/checkout"
        aria-label="Back to cart"
        className="w-[30px] h-[30px] bg-black rounded-full flex items-center justify-center"
      >
        <ArrowLeftRounded className="text-2xl text-light" />
      </Link>
      <div className="w-full border-light-grey border px-5">
        <div className="w-full flex flex-row items-center justify-between border-b-2 border-light-grey py-5">
          <h3 className="text-lg text-black ">Delivery Address</h3>
          {signedIn && (
            <button onClick={onEditAddress} aria-label="Change address" className="text-black">
              <EditIcon className="text-2xl" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 py-5">
          {!signedIn ? (
            <p className="text-ash text-lg">
              <Link href="/login" className="text-black underline">
                Log in
              </Link>{" "}
              to choose a delivery address.
            </p>
          ) : address ? (
            <>
              <p className="text-black text-lg font-bold">
                {address.first_name} {address.last_name}
              </p>
              <p className="text-ash text-lg">
                {formatAddress(address)} || {formatPhones(address)}
              </p>
            </>
          ) : (
            <button onClick={onEditAddress} className="text-left text-lg underline">
              Add a delivery address
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="border border-light-grey px-3 md:w-2/3">
          <div className="border-light-grey border-b py-3 ">
            <h3 className="text-lg text-black">Order Summary</h3>
          </div>
          <div className="py-5 flex flex-col gap-2">
            <div className="flex w-full  items-center justify-between">
              <p className="text-black text-lg">Items ({count})</p>
              <p className="text-black text-lg">${subtotal.toLocaleString()}</p>
            </div>
            <div className="flex w-full  items-center justify-between">
              <p className="text-black text-lg">Delivery</p>
              <p className="text-black text-lg">${DELIVERY_FEE}</p>
            </div>
            <div className="flex w-full  items-center justify-between">
              <p className="text-black text-lg">Total</p>
              <p className="text-black text-xl font-bold">
                ${(subtotal + DELIVERY_FEE).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 p-5 md:w-1/3 justify-center items-center">
          <Button variant={"outline"} size={"card"} href="/checkout">
            Modify Cart
          </Button>
          <Button
            variant={"default"}
            size={"card"}
            onClick={onConfirm}
            disabled={count === 0 || !address}
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceYourOrder;
