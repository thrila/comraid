import { Button } from "@/components/button/button";
import { FavouriteIcon } from "@/components/svgs";
import React from "react";

// Saved items (wishlist) aren't supported by the API yet (see README to-dos).
const SavedItemsPage = () => {
  return (
    <div className="w-full bg-light">
      <div className="flex-col flex">
        <div className="py-5 w-full border-y-[#CCCCCC4D] border-y">
          <h1 className="px-5 md:pl-10 text-2xl">Saved Items</h1>
        </div>
        <div className="w-full gap-6 flex flex-col pt-10 items-center min-h-[400px] px-5">
          <div className="rounded-full bg-light-grey p-8 flex items-center justify-center">
            <FavouriteIcon className="text-7xl text-red" />
          </div>
          <p className="text-xl font-bold text-center">You have no saved items yet</p>
          <Button variant={"default"} size={"card"} href="/shop">
            BROWSE THE SHOP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SavedItemsPage;
