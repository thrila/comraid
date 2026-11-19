import React from "react";
import Image from "next/image";

interface SocialCardType {
  image: string;
  title: string;
  description: string;
}
const SocialCard = ({ image, description, title }: SocialCardType) => {
  return (
    <div className="w-[330px] h-[260px]  flex flex-col justify-center items-center gap-2">
      <div className="h-[100%] w-full relative">
        {/* Image */}
        <Image
          src={image}
          width={300}
          height={260}
          alt={description}
          title={title}
          className="w-full h-full  object-fill"
        />
      </div>
    </div>
  );
};

export default SocialCard;
