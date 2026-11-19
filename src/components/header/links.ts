export interface NavItemType {
  name: string;
  link: string;
  pathname?: string;
}

const LINKS: Array<NavItemType> = [
  { name: "HOME", link: "/" },
  { name: "SHOP", link: "/shop" },
  { name: "WOMEN", link: "/shop/women" },
  { name: "MEN", link: "/shop/men" },
  { name: "SNEAKERS", link: "/shop/sneakers" },
  { name: "COSMETICS", link: "/shop/cosmetics" },
];
export default LINKS;
