import Link from "next/link";
import { NavItemType } from "./links";

const NavLink = ({ name, link, pathname }: NavItemType) => {
  return (
    <Link
      key={name}
      href={link}
      className={`link ${pathname === link ? "text-black relative after:bg-red after:absolute after:h-1 after:-bottom-2 after:left-0 after:w-full cursor-pointer" : "text-placeholder-ash"}`}
    >
      {name}
    </Link>
  );
};

export default NavLink;
