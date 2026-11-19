"use client";
import React from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  XIcon,
  YoutubeIcon,
} from "../svgs";
import Logo from "@/components/logo";

const Footer = () => {
  return (
    <div className="w-full bg-light md:py-10 md:px-10 px-5 py-5">
      <div className=" container mx-auto space-y-10 p-10 flex justify-between flex-col w-full">
        <div className="w-full flex flex-col md:flex-row justify-between gap-5">
          <div className="w-[150px] h-[30px] ">
            <Link href="/">
              <Logo className="text-3xl text-black" />
            </Link>
          </div>

          {/* Links and stuff */}
          <div className="flex flex-col md:flex-row text-white w-full justify-between md:space-x-14 gap-5 md:gap-0">
            <div className="w-full space-y-3 flex flex-col text-placeholder-ash">
              <div className="w-full text-2xl text-center md:text-left pb-3">
                <p className="text-black">QUICK LINKS</p>
              </div>
              <div className="w-full flex flex-col gap-5 text-center md:text-left">
                <Link href="/shop">Shop</Link>
                <Link href="/shop/women">Women</Link>
                <Link href="/shop/men">Men</Link>
                <Link href="/shop/sneakers">Sneakers</Link>
              </div>
            </div>

            <div className="w-full space-y-3 flex flex-col text-placeholder-ash">
              <div className="text-2xl pb-3">
                <p className="text-black text-center md:text-left">MY ACCOUNT</p>
              </div>
              <div className="w-full flex flex-col gap-5 text-center md:text-left">
                <Link href="/profile">My Account</Link>
                <Link href="/profile">Orders</Link>
                <Link href="/checkout">Cart</Link>
                <Link href="/login">Log in</Link>
              </div>
            </div>

            <div className="space-y-3 flex flex-col text-placeholder-ash">
              <div className="text-2xl pb-3">
                <p className="text-black">NEWSLETTER</p>
              </div>
              <form
                className="w-full flex rounded-full border border-black overflow-hidden"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.info("Newsletter sign-up is coming soon");
                }}
              >
                <input
                  type="email"
                  aria-label="Email for newsletter"
                  className=" px-2 py-2 outline-0 placeholder:text-placeholder-ash placeholder:text-lg w-full min-w-[200px]"
                  placeholder="Email"
                />
                <button
                  type="submit"
                  className="text-light px-5 py-[5px] bg-red rounded-full m-[2px]"
                >
                  SUBSCRIBE
                </button>
              </form>
              <div className="flex gap-5 pt-10">
                <Link href={"#"}>
                  {" "}
                  <FacebookIcon className="text-xl" />
                </Link>
                <Link href={"#"}>
                  {" "}
                  <InstagramIcon className="text-xl" />
                </Link>
                <Link href={"#"}>
                  {" "}
                  <XIcon title="x" className="text-xl" />
                </Link>
                <Link href={"#"}>
                  {" "}
                  <YoutubeIcon className="text-xl" />
                </Link>
                <Link href={"#"}>
                  {" "}
                  <PinterestIcon className="text-xl" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
