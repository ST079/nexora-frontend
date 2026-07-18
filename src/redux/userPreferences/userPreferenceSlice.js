import { createSlice } from "@reduxjs/toolkit";
import { Thermometer } from "lucide-react";

const userPreferencesSlice = createSlice({
  name: "userPreferences",
  initialState: {
    theme: "light",
    showCart: true,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme == "dark" ? "light" : "dark";
    },
  },
});

export const { toggleTheme } = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;
