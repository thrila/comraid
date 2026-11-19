"use client";
import React, { useState } from "react";
import PlaceYourOrder from "./place-your-order";
import SelectAddress from "./select-address";
import OrderSuccessful from "./order-successful";
import { useAddressesQuery, useMeQuery } from "@/lib/api/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart, selectCartItems } from "@/lib/slice/cartSlice";
import { useTrackInteraction } from "@/lib/shopper";

type Step = "review" | "address" | "success";

const PlaceOrderPage = () => {
  const [step, setStep] = useState<Step>("review");
  const [addressId, setAddressId] = useState<string>();
  const items = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const track = useTrackInteraction();

  const { data: me } = useMeQuery();
  const { data: addresses = [] } = useAddressesQuery(undefined, { skip: !me });
  const address =
    addresses.find((a) => a.id === addressId) ?? addresses.find((a) => a.is_default) ?? addresses[0];

  const handleConfirm = () => {
    // Purchases are the strongest signal the recommender gets.
    track("purchase", items.map((item) => item.product.id));
    dispatch(clearCart());
    setStep("success");
  };

  return (
    <div>
      {step === "review" && (
        <PlaceYourOrder
          address={address}
          signedIn={!!me}
          onEditAddress={() => setStep("address")}
          onConfirm={handleConfirm}
        />
      )}
      {step === "address" && (
        <SelectAddress
          selectedId={address?.id}
          onSelect={(id) => {
            setAddressId(id);
            setStep("review");
          }}
          onBack={() => setStep("review")}
        />
      )}
      {step === "success" && <OrderSuccessful />}
    </div>
  );
};

export default PlaceOrderPage;
