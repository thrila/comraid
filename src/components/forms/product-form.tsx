import React from "react";
import { AddImageIcon } from "../svgs";

const ProductForm = () => {
  return (
    <div className=" flex flex-col py-10">
      <div className="w-full flex gap-10">
        <div className="relative flex flex-col items-center justify-center w-[260px] h-[260px] bg-[#AEAEAE] cursor-pointer">
          {/* <!-- Hidden File Input --> */}
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* <!-- Custom File Input Design --> */}
          <div className="flex flex-col items-center text-gray-600">
            {/* <!-- Your SVG Icon --> */}
            <AddImageIcon className="text-9xl" />
            <span className="mt-2 text-md font-medium">Upload Image Here</span>
          </div>
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="py-5 flex flex-col">
            <label className="text-[#AEAEAE]">Product Name</label>
            <div className=" border border-[#AEAEAE] w-full">
              <input
                type="text"
                placeholder="Enter Product Name"
                className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
              />
            </div>
          </div>
          <div className="py-5 flex flex-col">
            <label className="text-[#AEAEAE]">Product Price</label>
            <div className=" border border-[#AEAEAE] w-full">
              <input
                type="text"
                placeholder="Enter Product Price"
                className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full gap-5 py-5">
        <div className="relative flex flex-col items-center justify-center w-[180px] h-[180px] bg-[#AEAEAE] cursor-pointer">
          {/* <!-- Hidden File Input --> */}
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* <!-- Custom File Input Design --> */}
          <div className="flex flex-col items-center text-gray-600">
            {/* <!-- Your SVG Icon --> */}
            <AddImageIcon className="text-6xl" />
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-center w-[180px] h-[180px] bg-[#AEAEAE] cursor-pointer">
          {/* <!-- Hidden File Input --> */}
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* <!-- Custom File Input Design --> */}
          <div className="flex flex-col items-center text-gray-600">
            {/* <!-- Your SVG Icon --> */}
            <AddImageIcon className="text-6xl" />
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-center w-[180px] h-[180px] bg-[#AEAEAE] cursor-pointer">
          {/* <!-- Hidden File Input --> */}
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* <!-- Custom File Input Design --> */}
          <div className="flex flex-col items-center text-gray-600">
            {/* <!-- Your SVG Icon --> */}
            <AddImageIcon className="text-6xl" />
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-center w-[180px] h-[180px] bg-[#AEAEAE] cursor-pointer">
          {/* <!-- Hidden File Input --> */}
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* <!-- Custom File Input Design --> */}
          <div className="flex flex-col items-center text-gray-600">
            {/* <!-- Your SVG Icon --> */}
            <AddImageIcon className="text-6xl" />
          </div>
        </div>
      </div>
      <div className="flex w-3/4 flex-row justify-between gap-5">
        <div className="flex flex-col w-full justify-between">
          <div className="py-5 flex flex-col">
            <label className="text-[#AEAEAE]">Product Price</label>
            <div className=" border border-[#AEAEAE] w-full">
              <input
                type="text"
                placeholder="Enter Product Price"
                className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
              />
            </div>
          </div>
          <div className="py-5 flex flex-col">
            <label className="text-[#AEAEAE]">Product Price</label>
            <div className=" border border-[#AEAEAE] w-full">
              <input
                type="text"
                placeholder="Enter Product Price"
                className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between w-full">
          <div className="py-5 flex flex-col">
            <label className="text-[#AEAEAE]">Product Price</label>
            <div className=" border border-[#AEAEAE] w-full">
              <input
                type="text"
                placeholder="Enter Product Price"
                className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
              />
            </div>
          </div>
          <div className="py-5 flex flex-col">
            <label className="text-[#AEAEAE]">Product Price</label>
            <div className=" border border-[#AEAEAE] w-full">
              <input
                type="text"
                placeholder="Enter Product Price"
                className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-3/4">
        <div className="py-5 flex flex-col">
          <label className="text-[#AEAEAE]">Product Price</label>
          <div className=" border border-[#AEAEAE] w-full">
            <input
              type="text"
              placeholder="Enter Product Price"
              className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
