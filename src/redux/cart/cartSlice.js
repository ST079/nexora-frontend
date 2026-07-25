import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    isOpen: false,
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
        // already in cart — just bump the quantity
        existing.quantity += 1;
      } else {
        state.items.push({ ...incoming, quantity: 1 });
      }

      state.totalPrice = calcTotal(state.items);
    },
    increaseQuantity: (state, action) => {
      // action.payload = item id
      const item = state.items.find((i) => i.id === action.payload);
      if (item.quantity >= item.stock) return;
      if (item) item.quantity += 1;
      state.totalPrice = calcTotal(state.items);
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      if (item.quantity <= 1) {
        // remove entirely when hitting 0
        state.items = state.items.filter((i) => i.id !== action.payload);
      } else {
        item.quantity -= 1;
      }
      state.totalPrice = calcTotal(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.totalPrice = calcTotal(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

const calcTotal = (items) =>
  items.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);

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
