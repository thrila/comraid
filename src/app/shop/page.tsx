import ShopBrowser from "@/components/shop/shop-browser";

const ShopPage = ({ searchParams }: { searchParams: { q?: string } }) => {
  return <ShopBrowser key={searchParams.q} initialQuery={searchParams.q} />;
};

export default ShopPage;
