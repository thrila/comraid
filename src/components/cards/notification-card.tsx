import React from "react";

const NotificationCard = () => {
  return (
    <div className="flex w-full px-5 py-6 bg-black gap-10 items-center">
      <div className="h-[10px] w-[10px] bg-red rounded-full"></div>
      <div className="flex flex-col gap-2">
        <h4 className="text-light text-lg font-semibold">One Step at a Time💚</h4>
        <p className="text-light text-md font-normal">
          Congratulations you just made your first Sale
        </p>
      </div>
    </div>
  );
};

export default NotificationCard;
