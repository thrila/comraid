"use client";
import { Button } from "@/components/button/button";
import { useLogoutMutation } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import React from "react";

const LogOutPage = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("You are logged out");
      router.push("/");
    } catch {
      toast.error("Could not log out. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex-col flex">
        <div className="py-5 w-full border-y-[#CCCCCC4D] border-y">
          <h1 className="px-5 md:pl-10 text-2xl">Log Out</h1>
        </div>
        <div className="w-full gap-5 py-5 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-full flex items-center justify-center">
            <p className="text-center">Do you want to Log out?</p>
          </div>
          <div className="flex gap-10">
            <Button
              size={"card"}
              variant={"outline"}
              className="bg-red text-light"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? "Logging out…" : "Log Out"}
            </Button>
            <Button variant={"item-card"} size={"card"}>
              Deactivate Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogOutPage;
