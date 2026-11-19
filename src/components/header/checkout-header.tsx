"use client";
import { useState } from "react";
import Link from "next/link";
import Search from "../forms/search";
import {
  CloseIcon,
  HamburgerIcon,
  SearchIcon,
} from "../svgs";
import CartLink from "./cart-link";
import AccountLink from "./account-link";
import Logo from "@/components/logo";

const CheckOutHeader = () => {
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const handleOpenMobileNav = () => {
    setOpenMobileNav(!openMobileNav);
  };

  return (
    <div className="w-full fixed top-0 left-0 bg-light z-50 shadow-md">
      <nav className="md:container md:mx-auto h-16 px-5 md:px-10 flex flex-row justify-between items-center gap-5 bg-light">
        {/* LOGO */}
        <div className="flex gap-10 items-center">
          <div
            className="w-[30px] h-[30px] rounded relative md:hidden cursor-pointer"
            onClick={handleOpenMobileNav}
          >
            <HamburgerIcon className="text-3xl" />
          </div>

          <Link href={"/"}>
            <Logo className="text-2xl text-black" />
          </Link>
        </div>

        {/* Links to Other sections */}

        <div
          className={`h-screen rounded-r-xl shadow-xl bg-light text-black fixed top-0 left-0 z-10 ${openMobileNav ? "w-[300px]" : "hidden"}`}
        >
          <div className="flex h-full flex-col w-full p-5">
            <div
              className=" flex justify-between items-center text-white text-3xl text-right px-10"
              onClick={handleOpenMobileNav}
            >
              <Link href={"/"}>
                <Logo className="text-2xl text-black" />
              </Link>
              <span className="bg-form-red w-8 h-8 rounded-full justify-center items-center flex">
                <CloseIcon className="text-2xl" />
              </span>
            </div>
            <div className="flex h-full flex-col justify-between px-10">
              <div className="flex flex-col justify-between gap-12 pt-10">
                <Search />
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full  hidden md:flex flex-row justify-center space-x-7 text-black ">
          <Search />
        </div>

        {/* Icons */}
        <div className="flex gap-5">
          <Link href={"/shop"} aria-label="Search the shop" className="md:hidden">
            <SearchIcon className="md:text-3xl text-2xl text-black" />
          </Link>
          <CartLink />
          <AccountLink />
        </div>
      </nav>
    </div>
  );
};

export default CheckOutHeader;
