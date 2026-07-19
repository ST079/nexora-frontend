import { combineReducers } from "@reduxjs/toolkit";
import userPreferenceReducer from "./userPreferences/userPreferenceSlice";
import authReducer from "./auth/authSlice";

const rootReducer = combineReducers({
    userPreferences: userPreferenceReducer,
    auth: authReducer,
});

export default rootReducer;
