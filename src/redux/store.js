import { configureStore } from "@reduxjs/toolkit";
import userPreferenceReducer from "./userPreferences/userPreferenceSlice";

const store = configureStore({
  reducer: {
    userPreferences: userPreferenceReducer,
  },
});

export { store };
