import ProfileForm from "@/components/forms/profile-form";
import React from "react";

const ProfilePage = () => {
  return (
    <div className="w-full flex bg-black py-5 min-h-screen">
      <div className="ml-[250px] bg-[#151419]  w-full p-5 flex flex-col">
        <div className="pl-10 py-5 flex justify-between">
          <h2 className="text-light text-2xl font-semibold">Profile</h2>
        </div>
        <div className="w-full flex flex-col gap-3 px-5">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
