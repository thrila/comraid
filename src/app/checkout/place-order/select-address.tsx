"use client";
import { Button } from "@/components/button/button";
import CustomerAddressForm from "@/components/forms/customer-address-form";
import { AddIcon, ArrowLeftRounded, BinIcon } from "@/components/svgs";
import { useAddressesQuery, useDeleteAddressMutation, type Address } from "@/lib/api/auth";
import React, { useState } from "react";

export const formatAddress = (a: Address) =>
  [a.address, a.city, a.state].filter(Boolean).join(", ");
export const formatPhones = (a: Address) =>
  [a.phone, a.additional_phone].filter(Boolean).join(" || ");

interface SelectAddressProps {
  selectedId?: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}

const SelectAddress = ({ selectedId, onSelect, onBack }: SelectAddressProps) => {
  const { data: addresses = [], isLoading } = useAddressesQuery();
  const [deleteAddress] = useDeleteAddressMutation();
  const [choice, setChoice] = useState(selectedId);
  const [adding, setAdding] = useState(false);

  return (
    <div className="py-10 md:px-10 px-5 flex flex-col gap-5">
      <button
        onClick={onBack}
        aria-label="Back to order summary"
        className="w-[30px] h-[30px] bg-black rounded-full flex items-center justify-center"
      >
        <ArrowLeftRounded className="text-2xl text-light" />
      </button>
      <div className="w-full border-light-grey border px-5 flex flex-col gap-5 pb-5">
        <div className="w-full flex flex-row items-center justify-between border-b-2 border-light-grey py-5">
          <h3 className="text-lg text-black ">Delivery Address</h3>
        </div>
        {isLoading && <p className="text-ash">Loading your addresses…</p>}
        {addresses.map((a) => (
          <label
            key={a.id}
            className="flex flex-row gap-5 items-center p-2 border border-light-grey cursor-pointer"
          >
            <input
              type="radio"
              name="address"
              checked={choice === a.id}
              onChange={() => setChoice(a.id)}
              className="w-6 h-6 accent-red"
            />
            <div className="flex flex-1 flex-col gap-1 py-5">
              <p className="text-black text-lg font-bold">
                {a.first_name} {a.last_name}
                {a.is_default && <span className="ml-2 text-xs text-ash font-normal">Default</span>}
              </p>
              <p className="text-ash text-md">{formatAddress(a)}</p>
              <p className="text-md text-ash">{formatPhones(a)}</p>
            </div>
            <button
              type="button"
              aria-label="Delete address"
              onClick={() => deleteAddress(a.id)}
              className="text-black"
            >
              <BinIcon className="text-xl" />
            </button>
          </label>
        ))}
        {adding ? (
          <CustomerAddressForm onSaved={() => setAdding(false)} />
        ) : (
          <div className="w-full flex flex-col md:flex-row gap-3 items-center justify-between p-2 border-light-grey border">
            <button onClick={() => setAdding(true)} className="flex gap-1 flex-row items-center">
              <AddIcon className="text-xl text-black" />
              <span className="text-md font-normal">Add Address</span>
            </button>
            <div className="flex items-center gap-5">
              <Button variant={"outline"} size={"card"} onClick={onBack}>
                Cancel
              </Button>
              <Button
                variant={"default"}
                size={"card"}
                disabled={!choice}
                onClick={() => choice && onSelect(choice)}
              >
                Select Address
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectAddress;
