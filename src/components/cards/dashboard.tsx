import React from "react";

interface DashboardCardT {
  title: string;
  icon: React.ReactNode;
  detail: string;
  /** Show the value as-is instead of as a dollar amount */
  plain?: boolean;
}

const DashboardCard = ({ title, icon, detail, plain }: DashboardCardT) => {
  return (
    <div className="py-2 bg-black flex flex-col gap-6 px-5 w-[200px]">
      <div className=" flex justify-between">
        <p className="text-light">{title}</p>
        <div className="bg-dashboard p-1 text-light rounded-sm"> {icon}</div>
      </div>
      <div className="">
        <p className="text-left text-2xl font-bold text-light">
          {plain || title === "Total Orders" ? detail : `$${detail}`}
        </p>
      </div>
    </div>
  );
};

export default DashboardCard;
