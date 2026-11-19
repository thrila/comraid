import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CartSliceType = {
  items: CartItem[];
};

const initialState: CartSliceType = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find((item) => item.product.id === action.payload.id);
      if (existing) existing.quantity += 1;
      else state.items.push({ product: action.payload, quantity: 1 });
    },
    setQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find((i) => i.product.id === action.payload.id);
      if (item) item.quantity = Math.max(1, action.payload.quantity);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
  },
});

export const { addToCart, setQuantity, removeFromCart, clearCart, hydrateCart } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartSliceType }) => state.cart.items;
export const selectCartCount = (state: { cart: CartSliceType }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartSliceType }) =>
  state.cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

export default cartSlice.reducer;
