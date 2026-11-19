"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { Button } from "@/components/button/button";
import DashboardCard from "@/components/cards/dashboard";
import AdminProductForm from "@/components/forms/admin-product-form";
import { ChartIcon, CheckListIcon, ProfileIcon, SaleTagIcon } from "@/components/svgs";
import { useGetProductsQuery } from "@/lib/api/catalog";
import {
  apiErrorMessage,
  downloadModelSnapshot,
  useDeleteProductMutation,
  useGetAdminStatsQuery,
  useLazyGetAdminStatsQuery,
} from "@/lib/api/admin";
import type { Product } from "@/types";

const TOKEN_KEY = "shop_admin_token";

/** Asks for the API's ADMIN_TOKEN and checks it before showing the tools. */
const TokenGate = ({ onUnlock }: { onUnlock: (token: string) => void }) => {
  const [token, setToken] = useState("");
  const [check, { isFetching }] = useLazyGetAdminStatsQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await check(token.trim()).unwrap();
      onUnlock(token.trim());
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not reach the API"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-black p-10 flex flex-col gap-5 max-w-[480px]">
      <h3 className="text-light text-xl font-semibold">Admin access</h3>
      <p className="text-search text-sm">
        Enter the <code>ADMIN_TOKEN</code> configured on the API server.
      </p>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Admin token"
        autoComplete="current-password"
        className="w-full bg-dashboard border border-search py-3 px-2 focus:outline-none text-light-grey"
        required
      />
      <Button type="submit" size={"sm"} className="bg-red" disabled={isFetching}>
        {isFetching ? "Checking…" : "Unlock"}
      </Button>
    </form>
  );
};

const Insights = ({ token }: { token: string }) => {
  const { data } = useGetAdminStatsQuery(token);
  if (!data) return null;
  const maxRegion = Math.max(...data.regions.map((r) => r.events), 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3">
        <DashboardCard title="Products" detail={String(data.products)} icon={<SaleTagIcon />} plain />
        <DashboardCard title="Shoppers" detail={String(data.shoppers)} icon={<ProfileIcon />} plain />
        <DashboardCard title="Interactions" detail={String(data.events)} icon={<ChartIcon />} plain />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-black p-5 flex flex-col gap-3">
          <h3 className="text-light font-semibold">Activity by region</h3>
          {data.regions.slice(0, 8).map((r) => (
            <div key={r.code} className="flex items-center gap-3 text-sm">
              <span className="w-28 text-light-grey truncate">{r.name}</span>
              <div className="flex-1 h-2 bg-dashboard">
                <div className="h-2 bg-red" style={{ width: `${(r.events / maxRegion) * 100}%` }} />
              </div>
              <span className="w-12 text-right text-search">{r.events}</span>
            </div>
          ))}
        </div>
        <div className="bg-black p-5 flex flex-col gap-3">
          <h3 className="text-light font-semibold">Most engaged products</h3>
          {data.topProducts.slice(0, 8).map(({ product, score }, i) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span className="text-light-grey truncate">
                {i + 1}. {product.name}
              </span>
              <span className="text-search">{score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductTable = ({ token, onEdit }: { token: string; onEdit: (p: Product) => void }) => {
  const { data, isLoading, isError } = useGetProductsQuery({ limit: 100, sort: "newest" });
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? Shoppers will no longer see it.`)) return;
    try {
      await deleteProduct({ token, id: product.id }).unwrap();
      toast.success(`${product.name} deleted`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not delete the product"));
    }
  };

  if (isLoading) return <p className="text-search">Loading products…</p>;
  if (isError || !data) return <p className="text-search">Could not load products.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-x border-b border-ash text-sm">
        <thead>
          <tr className="text-ash text-left border-y border-ash">
            <th className="p-3 font-normal">Product</th>
            <th className="p-3 font-normal">Category</th>
            <th className="p-3 font-normal">Price</th>
            <th className="p-3 font-normal">Tags</th>
            <th className="p-3 font-normal sr-only">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((product) => (
            <tr key={product.id} className="bg-[#151419] text-light-grey border-b border-dashboard">
              <td className="p-3">
                <Link
                  href={`/product/${product.id}`}
                  className="flex items-center gap-3 hover:text-light"
                  target="_blank"
                >
                  <Image
                    src={product.image}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover bg-light-grey"
                  />
                  {product.name}
                </Link>
              </td>
              <td className="p-3 capitalize">{product.category}</td>
              <td className="p-3">${product.price}</td>
              <td className="p-3 text-search">{product.tags.join(", ")}</td>
              <td className="p-3">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    className="text-light-grey border-light-grey hover:bg-dashboard"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </Button>
                  <Button size={"sm"} className="bg-red" onClick={() => handleDelete(product)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductsSection = () => {
  const [token, setToken] = useState<string | null>(null);
  // null = closed, "new" = creating, Product = editing
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!token) return;
    setExporting(true);
    try {
      await downloadModelSnapshot(token);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    try {
      setToken(sessionStorage.getItem(TOKEN_KEY));
    } catch {}
  }, []);

  const unlock = (value: string) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, value);
    } catch {}
    setToken(value);
  };

  const lock = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {}
    setToken(null);
  };

  return (
    <div className="flex flex-row w-full my-5 mr-5">
      <div className="bg-dashboard w-full p-5 md:px-10 flex flex-col gap-5 min-h-screen ml-[250px] overflow-y-auto">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <h2 className="text-light-grey text-2xl">Products & Recommendations</h2>
          {token && (
            <div className="flex gap-3">
              <Button size={"sm"} className="bg-red" onClick={() => setEditing("new")}>
                <span className="flex items-center gap-2">
                  <CheckListIcon /> Add product
                </span>
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                className="text-light-grey border-light-grey"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "Exporting…" : "Export model"}
              </Button>
              <Button
                variant={"outline"}
                size={"sm"}
                className="text-light-grey border-light-grey"
                onClick={lock}
              >
                Lock
              </Button>
            </div>
          )}
        </div>

        {!token ? (
          <TokenGate onUnlock={unlock} />
        ) : (
          <>
            {editing && (
              <AdminProductForm
                key={editing === "new" ? "new" : editing.id}
                token={token}
                product={editing === "new" ? undefined : editing}
                onDone={() => setEditing(null)}
              />
            )}
            <Insights token={token} />
            <ProductTable token={token} onEdit={setEditing} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsSection;
