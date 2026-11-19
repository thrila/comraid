import React from "react";

export enum DeliverState {
  "Delivered",
  "Sent",
  "Unsuccessful",
  "Cancelled",
}

const STATUS: Record<DeliverState, { label: string; className: string }> = {
  [DeliverState.Delivered]: { label: "Delivered", className: "bg-[#34C759]" },
  [DeliverState.Sent]: { label: "On its way", className: "bg-[#FF9500]" },
  [DeliverState.Unsuccessful]: { label: "Unsuccessful", className: "bg-ash" },
  [DeliverState.Cancelled]: { label: "Cancelled", className: "bg-ash" },
};

interface OrdersCardT {
  name: string;
  image?: string;
  orderNo: string;
  date: string;
  delivered: DeliverState;
}

const OrdersCard = ({ name, orderNo, date, delivered }: OrdersCardT) => {
  const status = STATUS[delivered];
  return (
    <div className="w-full flex flex-row py-5 px-8 gap-2">
      <div className="w-[180px] h-[150px] bg-light-grey relative shrink-0"></div>
      <div className="flex flex-col justify-between w-full py-2 gap-2">
        <div className="w-full flex justify-between items-center">
          <p className="text-black text-xl">{name}</p>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-ash text-sm">Order No: {orderNo}</p>
          <span className={`inline-block max-w-[150px] text-center text-light py-1 ${status.className}`}>
            {status.label}
          </span>
        </div>
        <p className="text-black text-lg">On {date}</p>
      </div>
    </div>
  );
};

export default OrdersCard;
