import NotificationCard from "@/components/cards/notification-card";
import React from "react";

const NotificationPage = () => {
  return (
    <div className="w-full flex bg-black py-5 min-h-screen">
      <div className="ml-[250px] bg-[#151419]  w-full py-5 flex flex-col">
        <div className="pl-10 py-10 flex justify-between">
          <h2 className="text-light text-3xl font-semibold">Notifications</h2>
        </div>
        <div className="w-full flex flex-col gap-3 py-5">
          <NotificationCard />
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
