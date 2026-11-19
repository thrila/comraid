"use client";
import React from "react";
import { useMeQuery } from "@/lib/api/auth";
import { ArrowUpIcon, ChartIcon } from "../svgs";

const YourProfile = () => {
  const { data: me } = useMeQuery();
  return (
    <div className="w-full px-5 py-5 bg-black">
      <div className="flex flex-row gap-5 items-center">
        <div className="bg-dashboard p-1 text-light rounded-sm">
          {" "}
          <ChartIcon />{" "}
        </div>
        <p className="text-light text-sm">Your Profile</p>
      </div>
      <div className="flex flex-row gap-3 pt-7 items-center pb-5 border-b border-light">
        <div className="bg-light h-[70px] w-[70px] rounded-full flex items-center justify-center text-3xl font-bold text-black uppercase">
          {me?.first_name.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-bold text-light">
            {me ? `${me.first_name} ${me.last_name}` : "Seller"}
          </p>
          <p className="text-xs text-light">{me?.email ?? "Log in to see your details"}</p>
        </div>
      </div>
      <div className="w-full flex flex-col">
        <div className="flex justify-between text-light py-2">
          <p className="text-xs">Total Customers</p>
          <div className="text-xs flex ">
            <ArrowUpIcon />
            <p>4.3%</p>
          </div>
        </div>
        <p className="font-bold text-2xl text-light">082</p>
      </div>
      <div className="pt-3 flex">
        <div className="w-[30px] h-[30px] bg-light border border-red rounded-full"></div>
        <div className="w-[30px] h-[30px] bg-light border border-red rounded-full z-10 -ml-3"></div>
        <div className="w-[30px] h-[30px] bg-light border border-red rounded-full z-20 -ml-3"></div>
        <div className="w-[30px] h-[30px] bg-light border border-red rounded-full z-30 -ml-3"></div>
      </div>
    </div>
  );
};

export default YourProfile;
