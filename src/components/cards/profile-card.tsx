import React from "react";

interface ProfileCardT {
  icon: React.ReactNode;
  name: string;
  active?: boolean;
}

const ProfileCardUser = ({ icon, name, active }: ProfileCardT) => {
  return (
    <div className="px-2 md:px-5 flex gap-3 items-center">
      <span className="text-2xl">{icon}</span>
      <p
        className={`text-md whitespace-nowrap relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 hover:after:w-full ${active ? "after:w-full" : "after:w-0"}`}
      >
        {name}
      </p>
    </div>
  );
};

export default ProfileCardUser;
