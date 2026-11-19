"use client";
import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { AddImageIcon } from "../svgs";
import { Button } from "../button/button";
import {
  apiErrorMessage,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadImageMutation,
  type ProductInput,
} from "@/lib/api/admin";
import type { Product, ProductCategory } from "@/types";

const CATEGORIES: ProductCategory[] = ["women", "men", "cosmetics", "sneakers"];
const STOCK_IMAGES = [
  "/images/categories/women.webp",
  "/images/categories/men.webp",
  "/images/categories/sneakers.webp",
  "/images/categories/cosmetics.webp",
];

const list = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const inputClass =
  "w-full bg-dashboard border border-search py-3 px-2 focus:outline-none focus:border-light text-light-grey placeholder:text-search";

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

const Field = ({ label, hint, children }: FieldProps) => (
  <label className="flex flex-col gap-1">
    <span className="text-search text-sm">{label}</span>
    {children}
    {hint && <span className="text-xs text-ash">{hint}</span>}
  </label>
);

interface AdminProductFormProps {
  token: string;
  /** Product being edited; omit to create a new one */
  product?: Product;
  onDone: () => void;
}

const AdminProductForm = ({ token, product, onDone }: AdminProductFormProps) => {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? ("women" as ProductCategory),
    price: product ? String(product.price) : "",
    description: product?.description ?? "",
    tags: product?.tags.join(", ") ?? "",
    colors: product?.colors.join(", ") ?? "",
    sizes: product?.sizes.join(", ") ?? "",
    image: product?.image ?? STOCK_IMAGES[0],
  });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const [createProduct, createState] = useCreateProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();
  const [uploadImage, uploadState] = useUploadImageMutation();
  const saving = createState.isLoading || updateState.isLoading;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images must be 5MB or smaller");
      return;
    }
    try {
      const { url } = await uploadImage({ token, file }).unwrap();
      setForm((f) => ({ ...f, image: url }));
    } catch (error) {
      toast.error(apiErrorMessage(error, "Upload failed"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !Number.isFinite(price) || price < 0) {
      toast.error("Add a name and a valid price");
      return;
    }
    const payload: ProductInput = {
      name: form.name.trim(),
      category: form.category,
      price,
      description: form.description.trim(),
      tags: list(form.tags).map((t) => t.toLowerCase()),
      colors: list(form.colors).map((c) => c.toLowerCase()),
      sizes: list(form.sizes).map((s) => s.toUpperCase()),
      image: form.image,
    };
    try {
      if (product) {
        await updateProduct({ token, id: product.id, changes: payload }).unwrap();
        toast.success(`${payload.name} updated`);
      } else {
        await createProduct({ token, product: payload }).unwrap();
        toast.success(`${payload.name} added to the shop`);
      }
      onDone();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save the product"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-black p-5">
      <h3 className="text-light text-xl font-semibold">
        {product ? `Edit ${product.name}` : "Add a new product"}
      </h3>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex flex-col gap-3 md:w-[260px] shrink-0">
          <label className="relative flex flex-col items-center justify-center w-full h-[260px] bg-dashboard border border-search cursor-pointer overflow-hidden">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {form.image ? (
              <Image
                src={form.image}
                alt="Product preview"
                width={260}
                height={260}
                className="w-full h-full object-cover"
              />
            ) : (
              <AddImageIcon className="text-9xl text-search" />
            )}
            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-light text-sm text-center py-2">
              {uploadState.isLoading ? "Uploading…" : "Click to upload an image"}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-1">
            {STOCK_IMAGES.map((src) => (
              <button
                type="button"
                key={src}
                onClick={() => setForm((f) => ({ ...f, image: src }))}
                className={`border ${form.image === src ? "border-red" : "border-transparent"}`}
                aria-label={`Use stock image ${src}`}
              >
                <Image src={src} alt="" width={40} height={40} className="w-full h-10 object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 grid md:grid-cols-2 gap-4">
          <Field label="Product name">
            <input className={inputClass} value={form.name} onChange={set("name")} required maxLength={120} />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price ($)">
            <input
              className={inputClass}
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={set("price")}
              required
            />
          </Field>
          <Field label="Sizes" hint="Comma separated, e.g. S, M, L or 40, 41">
            <input className={inputClass} value={form.sizes} onChange={set("sizes")} />
          </Field>
          <Field
            label="Tags"
            hint="Comma separated. The recommender uses these to find similar items"
          >
            <input
              className={inputClass}
              value={form.tags}
              onChange={set("tags")}
              placeholder="denim, casual, summer"
            />
          </Field>
          <Field label="Colours" hint="Comma separated">
            <input
              className={inputClass}
              value={form.colors}
              onChange={set("colors")}
              placeholder="black, white"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-[100px]`}
                value={form.description}
                onChange={set("description")}
                maxLength={2000}
              />
            </Field>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant={"outline"}
          size={"sm"}
          className="text-light-grey border-light-grey"
          onClick={onDone}
        >
          Cancel
        </Button>
        <Button type="submit" size={"sm"} className="bg-red px-6" disabled={saving}>
          {saving ? "Saving…" : product ? "Save changes" : "Add product"}
        </Button>
      </div>
    </form>
  );
};

export default AdminProductForm;
