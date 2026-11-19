import DashboardCard from "@/components/cards/dashboard";
import VendorTable from "@/components/tables/vendor-table";
import { ProfileIcon } from "@/components/svgs";
import React from "react";

const BuyersSection = () => {
  return (
    <div className="flex flex-row w-full my-5 mr-5">
      <div className=" bg-dashboard w-full pt-5 flex flex-col gap-5 min-h-screen ml-[250px] overflow-y-auto">
        <div className="px-10 flex flex-row justify-between">
          <h2 className="text-light-grey text-2xl">Buyers Overview</h2>
          <DashboardCard title="Total Vendors" detail="42" icon={<ProfileIcon />} />
        </div>
        <div className="px-5">
          <VendorTable />
        </div>
      </div>
    </div>
  );
};

export default BuyersSection;
