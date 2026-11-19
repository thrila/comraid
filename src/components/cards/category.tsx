import React from "react";
import Image from "next/image";
import Link from "next/link";

interface CategoryCardType {
  image: string;
  name: string;
}

const CategoryCard = ({ image, name }: CategoryCardType) => {
  return (
    <Link
      href={`/shop/${name.toLowerCase()}`}
      className="group shrink-0 basis-2/3 md:basis-0 md:flex-1 min-w-0 flex flex-col items-center gap-3"
    >
      <div className="w-full aspect-[311/250] overflow-hidden bg-light-grey">
        <Image
          src={image}
          width={622}
          height={500}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="md:text-2xl text-xl font-semibold group-hover:text-red transition-colors">{name}</p>
    </Link>
  );
};

export default CategoryCard;
