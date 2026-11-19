import { notFound } from "next/navigation";
import ShopBrowser from "@/components/shop/shop-browser";
import type { ProductCategory } from "@/types";

const CATEGORIES: ProductCategory[] = ["women", "men", "cosmetics", "sneakers"];

const CategoryPage = ({ params }: { params: { category: string } }) => {
  const category = params.category.toLowerCase() as ProductCategory;
  if (!CATEGORIES.includes(category)) notFound();
  return <ShopBrowser key={category} initialCategory={category} />;
};

export default CategoryPage;
