import React from "react";
import { SocialData } from "@/lib/UI/home";
import SocialCard from "../cards/social-card";
import { Carousel } from "../carousel/main-carousel";

const SocialSection = () => {
  return (
    <div className="w-full flex flex-col md:gap-5 gap-3 py-5">
      <div className="w-full flex flex-col items-center justify-center">
        <h3 className="text-black font-semibold text-2xl md:text-4xl">Follow us on Instagram</h3>
        <p className="text-lg font-thin text-black md:text-2xl">@shop</p>
      </div>
      <div className="md:flex hidden md:container md:mx-auto justify-between md:gap-5 gap-1  md:px-10 px-5">
        {SocialData.map((info, i) => (
          <SocialCard key={i} title={info.title} image={info.image} description={info.description} />
        ))}
      </div>
      <div className="md:hidden">
        <Carousel>
          {SocialData.map((info, i) => (
            <SocialCard key={i} title={info.title} image={info.image} description={info.description} />
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default SocialSection;
