"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { makeStore, AppStore } from "../lib/store";
import { hydrateCart } from "../lib/slice/cartSlice";

const CART_KEY = "shop_cart";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  // Enables refetchOnFocus / refetchOnReconnect for the live recommendation feeds.
  useEffect(() => setupListeners(storeRef.current!.dispatch), []);

  // Restore the cart after mount (not during render) to avoid hydration mismatches,
  // then keep localStorage in sync.
  useEffect(() => {
    const store = storeRef.current!;
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) store.dispatch(hydrateCart(JSON.parse(saved)));
    } catch {
      // Corrupt or unavailable storage: start with an empty cart.
    }

    let lastItems = store.getState().cart.items;
    return store.subscribe(() => {
      const items = store.getState().cart.items;
      if (items === lastItems) return;
      lastItems = items;
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
      } catch {}
    });
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
