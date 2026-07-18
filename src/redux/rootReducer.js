import { combineReducers } from "@reduxjs/toolkit";
import userPreferenceReducer from "./userPreferences/userPreferenceSlice";


const rootReducer = combineReducers({
  userPreferences: userPreferenceReducer,
});

export default rootReducer;