import React from "react";
import {
  CartIcon,
  FavouriteIcon,
  HelpIcon,
  LiveChatIcon,
  LogOutIcon,
  ProfileIcon,
  VoucherIcon,
} from "@/components/svgs";
import ProfileCardUser from "@/components/cards/profile-card";
import { Pages } from "@/app/profile/pages";

interface ProfileSideBarT {
  active: Pages;
  name: (page: Pages) => void;
}

const ITEMS: { page: Pages; label: string; icon: React.ReactNode }[] = [
  { page: Pages.AccountInformation, label: "My Account", icon: <ProfileIcon /> },
  { page: Pages.SavedItems, label: "Saved Items", icon: <FavouriteIcon /> },
  { page: Pages.Order, label: "Orders", icon: <CartIcon /> },
  { page: Pages.Voucher, label: "Voucher", icon: <VoucherIcon /> },
  { page: Pages.Help, label: "Help", icon: <HelpIcon /> },
  { page: Pages.LiveChat, label: "Live Chat", icon: <LiveChatIcon /> },
  { page: Pages.Logout, label: "Log Out", icon: <LogOutIcon /> },
];

/** Sticky column on desktop; a scrollable tab strip on mobile. */
const ProfileSideBar = ({ active, name }: ProfileSideBarT) => {
  return (
    <nav
      aria-label="Account"
      className="md:sticky md:top-16 md:self-start md:w-[250px] md:shrink-0 md:min-h-[calc(100vh-4rem)] md:border-r border-b md:border-b-0 border-[#CCCCCC4D] md:pt-10 bg-light"
    >
      <ul className="flex md:flex-col gap-2 md:gap-6 overflow-x-auto px-3 md:px-0 py-3 md:py-0 md:pr-5">
        {ITEMS.map((item) => (
          <li key={item.label} className="shrink-0">
            <button
              onClick={() => name(item.page)}
              aria-current={active === item.page ? "page" : undefined}
              className={`w-full text-left py-1 ${active === item.page ? "text-red" : "text-black"}`}
            >
              <ProfileCardUser name={item.label} icon={item.icon} active={active === item.page} />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ProfileSideBar;
