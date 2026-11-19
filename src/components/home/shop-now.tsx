import React from "react";
import { Button } from "../button/button";
import { CurlyArrow } from "../svgs";

const ShopNow = () => {
  return (
    <div className="w-full z-20 flex flex-row justify-center gap-5">
      <div className="absolute left-[10%] top-[10%]">
        <span>
          <CurlyArrow className="md:text-9xl text-5xl" />
        </span>
      </div>
      <div className="px-5 py-5 md:w-2/3 w-full  bg-light">
        <div className="w-full px-5 flex flex-col justify-center items-center gap-10">
          <h2 className="font-bold text-2xl md:text-4xl text-center md:px-20">
            REAL FASHION MEETS ART FOR REAL PEOPLE
          </h2>
          <p className="text-placeholder-ash text-lg md:px-10 text-center">
            Step into a world where fashion transcends trends, becoming a living canvas that
            celebrates creativity and individuality. Where real fashion meets art, every piece is
            designed with you in mind.
          </p>
          <Button variant={"default"} size={"card"} href="/shop">
            SHOP NOW
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopNow;
