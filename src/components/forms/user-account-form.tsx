"use client";
import React from "react";
import { useMeQuery } from "@/lib/api/auth";

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="w-full flex flex-col gap-1">
    <label className="text-sm text-ash">{label}</label>
    <input
      className="w-full border border-ash text-black py-2 px-2 bg-light-grey"
      value={value}
      readOnly
    />
  </div>
);

/** Read-only for now: profile editing isn't supported by the API yet (see README to-dos). */
const UserAccountForm = () => {
  const { data: me } = useMeQuery();
  if (!me) return null;

  return (
    <div className="w-full py-5 flex flex-col justify-center items-center gap-5 px-5 md:px-10">
      <div className="rounded-full bg-ash w-[90px] h-[90px] justify-center items-center flex">
        <p className="text-5xl font-bold text-light uppercase">{me.first_name.charAt(0) || "?"}</p>
      </div>
      <div className="w-full md:w-2/3 flex flex-col gap-5">
        <Field label="Username" value={me.username} />
        <Field label="Full name" value={`${me.first_name} ${me.last_name}`} />
        <Field label="Email address" value={me.email} />
        <Field label="Account type" value={me.is_seller ? "Seller" : "Shopper"} />
      </div>
    </div>
  );
};

export default UserAccountForm;
