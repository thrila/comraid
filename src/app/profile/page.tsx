"use client";
import ProfileSideBar from "@/components/sidebar/profile";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogOutPage from "./logout";
import AccountOverviewPage from "./account-overview";
import HelpPage from "./help";
import SavedItemsPage from "./saved-items";
import VoucherPage from "./vouchers";
import LiveChatPage from "./live-chat";
import OrdersPage from "./orders";
import { Pages } from "./pages";
import { useMeQuery } from "@/lib/api/auth";

const ProfilePage = () => {
  const [choosePage, setPage] = useState(Pages.AccountInformation);
  const router = useRouter();
  const { data: me, isLoading, isError } = useMeQuery();

  // The account area needs a signed-in shopper.
  useEffect(() => {
    if (!isLoading && (isError || !me)) router.replace("/login");
  }, [isLoading, isError, me, router]);

  if (!me) return <div className="min-h-[60vh] px-10 py-10 text-ash">Loading your account…</div>;

  return (
    <div className="w-full bg-light md:flex">
      <ProfileSideBar active={choosePage} name={(page) => setPage(page)} />
      <div className="w-full min-w-0">
        {choosePage == Pages.AccountInformation && <AccountOverviewPage />}
        {choosePage == Pages.Logout && <LogOutPage />}
        {choosePage == Pages.Help && <HelpPage />}
        {choosePage == Pages.SavedItems && <SavedItemsPage />}
        {choosePage == Pages.Voucher && <VoucherPage />}
        {choosePage == Pages.LiveChat && <LiveChatPage />}
        {choosePage == Pages.Order && <OrdersPage />}
      </div>
    </div>
  );
};

export default ProfilePage;
