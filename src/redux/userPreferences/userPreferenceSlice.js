import { createSlice } from "@reduxjs/toolkit";
import { Thermometer } from "lucide-react";

const userPreferencesSlice = createSlice({
  name: "userPreferences",
  initialState: {
    theme: "dark",
    showCart: true,
  },
  reducers: {},
});

export default userPreferencesSlice.reducer;