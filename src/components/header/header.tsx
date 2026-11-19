"use client";
import NavLink from "./nav-links";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CloseIcon,
  HamburgerIcon,
  SearchIcon,
} from "../svgs";
import LINKS from "./links";
import CartLink from "./cart-link";
import AccountLink from "./account-link";
import Logo from "@/components/logo";

const Header = () => {
  const path = usePathname();
  const navlinks = LINKS.map((nav) => <NavLink key={nav.name} name={nav.name} pathname={path} link={nav.link} />);
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const handleOpenMobileNav = () => {
    setOpenMobileNav(!openMobileNav);
  };

  const mobileNav = LINKS.map((nav) => (
    <Link
      onClick={handleOpenMobileNav}
      key={nav.name}
      href={nav.link}
      className={`link ${path === nav.link ? "text-black relative after:bg-form-red after:absolute after:h-1 after:-bottom-2 after:left-0 after:w-2/3 cursor-pointer" : "text-placeholder-ash"}`}
    >
      {nav.name}
    </Link>
  ));
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
              <div className="flex flex-col justify-between gap-12 pt-10">{mobileNav}</div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-row space-x-7 text-black ">{navlinks}</div>

        {/* Icons */}
        <div className="flex gap-5">
          <Link href={"/shop"} aria-label="Search the shop">
            <SearchIcon className="md:text-3xl text-2xl text-black" />
          </Link>
          <CartLink />
          <AccountLink />
        </div>
      </nav>
    </div>
  );
};

export default Header;
