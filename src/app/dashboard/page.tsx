import React from "react";
import { NotficationRoundIcon, UploadImageIcon, CheckListIcon, MoneyIcon } from "@/components/svgs";
import DashboardCard from "@/components/cards/dashboard";
import YourProfile from "@/components/cards/your-profile";
import DoughnutProfile from "@/components/chart/doughnut-profile";
import SalesOverview from "@/components/chart/sales-overview";

const Dashboard = () => {
  return (
    <div className="w-full flex bg-black">
      {/* Page with details */}
      <div className="flex flex-row w-full my-5 mr-5">
        <div className=" bg-dashboard w-2/3 pt-5 px-5 flex flex-col gap-5 min-h-screen ml-[250px] overflow-y-auto">
          <div className="w-full  flex justify-between items-center">
            <button className="flex gap-2 py-2 px-2 bg-black items-center">
              <p className="text-3xl text-light">
                <UploadImageIcon />
              </p>
              <p className="text-xs text-light font-bold">Upload a new Image product</p>
            </button>
            <p className="text-4xl text-light">
              <NotficationRoundIcon />
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <DashboardCard title="Total Orders" detail="22" icon={<CheckListIcon />} />
            <DashboardCard title="Total Sales" detail="58.47" icon={<MoneyIcon />} />
            <DashboardCard title="Total Balance" detail="1003.43" icon={<MoneyIcon />} />
          </div>
          <div className="bg-black p-5">
            <SalesOverview />
          </div>
        </div>
        <div className="w-1/3 bg-dashboard pt-5 flex flex-col gap-5 pr-5">
          <YourProfile />
          <div className="bg-black flex flex-col">
            <div className="flex justify-between text-light p-5">
              <p>Orders Activity</p>
              <button className="text-light bg-dashboard_table border border-light rounded-xl py-1 px-2">
                View all
              </button>
            </div>
            <DoughnutProfile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
