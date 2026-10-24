import { createSlice } from "@reduxjs/toolkit";
import { productImage } from "@/utils/format";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    isOpen: false,
    totalItems: 0,
    totalPrice: 0,
  },
  reducers: {
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },

    addToCart: (state, action) => {
      const incoming = action.payload;
      const qtyToAdd = incoming.quantity ?? 1;
      const existing = state.items.find((item) => item.id === incoming.id);

      if (existing) {
        // Refresh the stock snapshot so the cap reflects the latest product data.
        if (incoming.stock !== undefined) existing.stock = incoming.stock;
        existing.quantity = Math.min(
          existing.quantity + qtyToAdd,
          stockLimit(existing),
        );
      } else {
        // Nothing to add when the product is out of stock.
        if (stockLimit(incoming) <= 0) return;
        state.items.push({
          ...incoming,
          quantity: Math.min(qtyToAdd, stockLimit(incoming)),
        });
      }

      state.totalPrice = calcTotalPrice(state.items);
      state.totalItems = calTotalItems(state.items);
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item || item.quantity >= stockLimit(item)) return;
      item.quantity += 1;
      state.totalPrice = calcTotalPrice(state.items);
      state.totalItems = calTotalItems(state.items);
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      if (item.quantity <= 1) {
        state.items = state.items.filter((i) => i.id !== action.payload);
      } else {
        item.quantity -= 1;
      }
      state.totalPrice = calcTotalPrice(state.items);
      state.totalItems = calTotalItems(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.totalPrice = calcTotalPrice(state.items);
      state.totalItems = calTotalItems(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalItems = 0;
    },
  },
});

// Items saved before stock was tracked have no stock field; don't cap those to NaN.
export const stockLimit = (item) =>
  Number.isFinite(Number(item?.stock)) ? Number(item.stock) : Infinity;

// The cart keeps a small snapshot of the product; the server re-prices it at checkout.
export const cartItemFrom = (product, quantity = 1) => ({
  id: product._id ?? product.id,
  name: product.name,
  price: product.price,
  imageUrls: productImage(product),
  stock: product.stock,
  brand: product.brand,
  quantity,
});

const calcTotalPrice = (items) =>
  items.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);

const calTotalItems = (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

export const {
  openCart,
  closeCart,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
