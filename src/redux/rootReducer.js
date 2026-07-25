import { combineReducers } from "@reduxjs/toolkit";
import userPreferenceReducer from "./userPreferences/userPreferenceSlice";
import authReducer from "./auth/authSlice";
import cartReducer from "./cart/cartSlice"

const rootReducer = combineReducers({
  userPreferences: userPreferenceReducer,
  auth: authReducer,
  cart: cartReducer,
});

export default rootReducer;
