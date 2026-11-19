import React from "react";

interface ShopCheckT {
  name: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const ShopCheck = ({ name, checked, onChange }: ShopCheckT) => {
  const id = `shop-check-${name}`;
  return (
    <div className="flex gap-2 items-center">
      <input
        id={id}
        className="border border-black w-[15px] h-[15px] accent-red"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <label htmlFor={id} className="text-sm capitalize">
        {name}
      </label>
    </div>
  );
};

export default ShopCheck;
