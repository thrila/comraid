import React from "react";
import { Button } from "../button/button";

const OrderTrackingCard = () => {
  return (
    <div className="px-10 py-5 flex justify-between items-center bg-[#151419]">
      <div className="flex flex-row items-center">
        <div className="w-[10px] h-[10px] bg-red rounded-full mr-[20px]"> </div>
        <p className="text-light-grey">John Dee Just Ordered </p>
      </div>
      <div className="flex flex-row items-center">
        <p className="mr-[20px] text-red">Not delivered </p>
        <Button
          className="border-light-grey text-sm border text-light-grey"
          variant={"outline"}
          size={"sm"}
        >
          {" "}
          See Details
        </Button>
      </div>
    </div>
  );
};

export default OrderTrackingCard;
