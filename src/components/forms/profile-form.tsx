import React from "react";
import { Button } from "../button/button";
import { CameraIcon } from "../svgs";

const ProfileForm = () => {
  return (
    <div className=" flex flex-col py-10">
      <div className="w-full flex gap-10">
        <div className="relative flex flex-col items-center justify-center rounded-full w-[260px] h-[260px] bg-[#AEAEAE] cursor-pointer">
          {/* <!-- Hidden File Input --> */}
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* <!-- Custom File Input Design --> */}
          <div className="flex flex-col items-center text-gray-600">
            {/* <!-- Your SVG Icon --> */}
            <p className="text-9xl text-light">J</p>
          </div>
          <div className="bg-light p-5 rounded-full absolute bottom-0 right-5">
            <CameraIcon className="text-black text-3xl" />
          </div>
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="py-3 flex flex-col">
            <label className="text-[#AEAEAE]">Username</label>
            <div className=" border border-[#AEAEAE] w-full">
              <input
                type="text"
                placeholder="Enter Username"
                className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
              />
            </div>
          </div>
          <div className="py-3 flex flex-col">
            <label className="text-[#AEAEAE]">Full Name</label>
            <div className=" border border-[#AEAEAE] w-full">
              <input
                type="text"
                placeholder="Enter Full Name"
                className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-2/4 py-5">
        <div>
          <h3 className="text-2xl text-light">Bank Details</h3>
        </div>
        <div className="py-5 flex flex-col">
          <label className="text-[#AEAEAE]">Bank Name</label>
          <div className=" border border-[#AEAEAE] w-full">
            <input
              type="text"
              placeholder="Enter Bank Name"
              className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
            />
          </div>
        </div>
        <div className="py-2 flex flex-col">
          <label className="text-[#AEAEAE]">Account Number</label>
          <div className=" border border-[#AEAEAE] w-full">
            <input
              type="text"
              placeholder="Enter Account Number"
              className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
            />
          </div>
        </div>
        <div className="py-2 flex flex-col">
          <label className="text-[#AEAEAE]">Account Name</label>
          <div className=" border border-[#AEAEAE] w-full">
            <input
              type="text"
              placeholder="Enter Account Name"
              className="w-full bg-[#1F1E25] py-3 px-2 focus:outline-none text-ash "
            />
          </div>
        </div>
      </div>
      <div className="w-full flex justify-end">
        {" "}
        <Button variant={"default"} size={"card"}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
