import React from "react";
import Image from "next/image";
import Link from "next/link";

interface FeaturedCardType {
  image: string;
  title: string;
  category: string;
  href: string;
}

const FeaturedCard = ({ image, title, category, href }: FeaturedCardType) => {
  return (
    <Link
      href={href}
      className="md:max-w-[300px] w-full md:h-[400px] h-[250px] flex flex-col justify-center items-center"
    >
      <div className="w-full h-[80%]">
        <Image
          src={image}
          alt={title}
          width={300}
          height={300}
          title={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full flex flex-col items-center justify-center pt-5">
        <p className="md:text-lg text-center text-md font-semibold">{title}</p>
        <span className="text-ash md:text-md text-sm">{category}</span>
      </div>
    </Link>
  );
};

export default FeaturedCard;
