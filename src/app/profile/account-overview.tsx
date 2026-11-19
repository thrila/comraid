"use client";
import UserAccountForm from "@/components/forms/user-account-form";
import { useAddressesQuery } from "@/lib/api/auth";
import { formatAddress } from "@/app/checkout/place-order/select-address";
import Link from "next/link";

const AccountOverviewPage = () => {
  const { data: addresses = [], isLoading } = useAddressesQuery();
  const address = addresses.find((a) => a.is_default) ?? addresses[0];

  return (
    <div className="flex-col flex">
      <div className="py-5 w-full border-y-[#CCCCCC4D] border-y">
        <h1 className="px-5 md:pl-10 text-2xl">Account Overview</h1>
      </div>
      <div className="w-full flex flex-col md:flex-row">
        <div className="md:w-2/3 md:border-r-[#CCCCCC4D] md:border-r">
          <UserAccountForm />
        </div>
        <div className="md:w-1/3 px-5 md:px-10 pb-10">
          <p className="py-5 font-semibold">Default shipping address</p>
          <div className="text-ash flex flex-col gap-1">
            {isLoading ? (
              <p>Loading…</p>
            ) : address ? (
              <>
                <p className="text-black">
                  {address.first_name} {address.last_name}
                </p>
                <p>{formatAddress(address)}</p>
                <p>{address.phone}</p>
              </>
            ) : (
              <p>
                No saved address yet. You can add one at{" "}
                <Link href="/checkout/place-order" className="text-black underline">
                  checkout
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverviewPage;
