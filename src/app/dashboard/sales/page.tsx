import DashboardCard from "@/components/cards/dashboard";
import { MoneyIcon } from "@/components/svgs";
import SalesOverviewTable from "@/components/tables/sales-overview";

const SalesPage = () => {
  return (
    <div className="w-full flex bg-black py-5 pr-5 min-h-screen">
      <div className="ml-[250px] bg-[#151419]  w-full p-5 flex flex-col">
        <div className="pl-10 py-10 flex justify-between">
          <h2 className="text-light text-3xl font-semibold">Sales</h2>
          <div className=" flex gap-5">
            <DashboardCard title="Today's Sales" detail="54.247" icon={<MoneyIcon />} />
            <DashboardCard title="Balance" detail="54.247" icon={<MoneyIcon />} />
          </div>
        </div>
        <div className="w-full pl-10 flex flex-col gap-3 py-5">
          <h3 className="text-xl text-light font-medium">Today</h3>
          <SalesOverviewTable />
        </div>
        <div className="w-full pl-10 flex flex-col gap-3 py-5">
          <h3 className="text-xl text-light font-medium">Yesterday</h3>
          <SalesOverviewTable />
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
