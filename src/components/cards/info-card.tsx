import React from "react";
import Image from "next/image";

interface InfoCardType {
  image: string;
  title: string;
  description: string;
}

const InfoCard = ({ image, title, description }: InfoCardType) => {
  return (
    <div className="w-full max-w-[330px] h-[60px] flex flex-row gap-5 items-center">
      <div className="w-[40px] h-[40px]">
        <Image src={image} alt={title} width={100} height={100} className="w-full" />
      </div>
      <div className="flex flex-col">
        <p className="font-semibold text-black text-md inline-block">{title}</p>
        <p className="text-ash text-md">{description}</p>
      </div>
    </div>
  );
};

export default InfoCard;
