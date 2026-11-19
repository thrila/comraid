"use client";
import Link from "next/link";
import { ProfileIcon } from "../svgs";
import { useMeQuery } from "@/lib/api/auth";

const AccountLink = () => {
  const { data: me } = useMeQuery();
  return (
    <Link href={me ? "/profile" : "/login"} aria-label={me ? "Your account" : "Log in"}>
      <ProfileIcon className="md:text-3xl text-2xl" />
    </Link>
  );
};

export default AccountLink;
