import React from "react";
import { UploadImageIcon, DeleteIcon } from "@/components/svgs";
import ProductForm from "@/components/forms/product-form";

const ProductManagement = () => {
  return (
    <div className="w-full flex bg-black py-5 pr-5">
      <div className="ml-[250px] bg-[#151419] min-h-screen w-full p-5 flex flex-col">
        <div className="w-full  flex justify-between items-center">
          <button className="flex gap-2 py-2 px-2 bg-[#14D361] items-center">
            <p className="text-2xl text-black">
              <UploadImageIcon />
            </p>
            <p className="text-xs text-light font-bold">Upload a new Image product</p>
          </button>
          <button className="flex gap-2 py-2 px-2 bg-[#B52323] items-center">
            <p className="text-2xl text-light">
              <DeleteIcon />
            </p>
            <p className="text-xs text-light font-bold">Upload a new Image product</p>
          </button>
        </div>
        <ProductForm />
      </div>
    </div>
  );
};

export default ProductManagement;
