import { createSlice } from "@reduxjs/toolkit";

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
      const existing = state.items.find((item) => item.id === incoming.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...incoming, quantity: 1 });
      }

      state.totalPrice = calcTotalPrice(state.items);
      state.totalItems = calTotalItems(state.items);
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item.quantity >= item.stock) return;
      if (item) item.quantity += 1;
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
