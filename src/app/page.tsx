"use client";
import { Button } from "@/components/button/button";
import CategoryCard from "@/components/cards/category";
import InfoCard from "@/components/cards/info-card";
import { Carousel } from "@/components/carousel/main-carousel";
import ShopNow from "@/components/home/shop-now";
import FeaturedProducts from "@/components/layout/featured-products";
import ForYou from "@/components/layout/for-you";
import NewProducts from "@/components/layout/new-products";
import SocialSection from "@/components/layout/social";
import { InfoData, CategoryData } from "@/lib/UI/home";

export default function Home() {
  return (
    <div className="min-h-screen w-full pt-6 bg-light">
      <div className="w-full -mb-16 z-20 relative  flex justify-center px-5 md:px-0">
        <ShopNow />
      </div>
      <div className="w-full bg-home-one md:h-[500px] h-[250px] bg-cover bg-center z-10 relative"></div>
      <div className="flex md:flex-row flex-col md:justify-evenly md:gap-0 gap-5 items-center px-5 py-10 md:px-10">
        {InfoData.map((info) => (
          <InfoCard
            key={info.title}
            image={info.image}
            title={info.title}
            description={info.description}
          />
        ))}
      </div>
      <div className="bg-get-discount bg-cover bg-center w-full  md:px-10 h-[500px] flex flex-col justify-start md:justify-center pt-10 md:pt-0 md:container md:mx-auto px-5">
        <div className="w-full flex flex-col items-center md:w-[300px] gap-5">
          <p className="md:text-4xl text-3xl text-black text-center md:text-left font-semibold">
            Get Discount up to<span className="text-red"> 50%</span> off this June!
          </p>
          <Button size={"card"} href="/shop">
            Shop Now
          </Button>
        </div>
      </div>
      <ForYou />
      <div className="hidden md:container md:mx-auto gap-5 py-10 px-10 md:flex">
        {CategoryData.map((info) => (
          <CategoryCard key={info.title} name={info.title} image={info.image} />
        ))}
      </div>
      <div className="w-full py-10 md:hidden">
        <Carousel>
          {CategoryData.map((info) => (
            <CategoryCard key={info.title} name={info.title} image={info.image} />
          ))}
        </Carousel>
      </div>
      <NewProducts />
      <div className="bg-summer-sales bg-cover bg-center w-full  md:px-20 px-5 md:h-[500px] h-[250px] flex flex-col justify-center items-center gap-5 ">
        <h2 className="text-3xl md:text-4xl text-black font-bold"> Summer Sales</h2>
        <p className="md:text-3xl text-xl font-thin text-black">Coming Soon!</p>
        <div className="w-[200px]">
          <Button size={"card"} href="/shop">
            Shop Now
          </Button>
        </div>
      </div>
      <SocialSection />
      <FeaturedProducts />
    </div>
  );
}
