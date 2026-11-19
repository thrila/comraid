import OrderTrackingCard from "@/components/cards/order-tracking";

const OrderTracking = () => {
  return (
    <div className="flex flex-row w-full my-5 mr-5">
      <div className=" bg-dashboard w-full pt-5 flex flex-col gap-5 min-h-screen ml-[250px] overflow-y-auto">
        <div className="px-10">
          <h2 className="text-light-grey text-2xl">Order Tracking</h2>
        </div>
        <div className="fle flex-col gap-5">
          <OrderTrackingCard />
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
