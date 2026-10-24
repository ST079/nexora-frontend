"use client";
import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { UNAUTHORIZED_EVENT } from "@/api";
import { logout } from "./auth/authSlice";
import { persistor, store } from "./store";

// Keeps the `dark` class on <html> in step with the stored preference, so dark
// mode works on every route group (storefront, dashboard and auth pages).
const ThemeSync = () => {
  const theme = useSelector((state) => state.userPreferences.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
};

// The API client can't import the store (circular import), so it announces
// expired or invalid sessions with an event and we log the user out here.
const SessionWatcher = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const onUnauthorized = () => dispatch(logout());
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [dispatch]);

  return null;
};

const AppProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeSync />
        <SessionWatcher />
        {children}
      </PersistGate>
    </Provider>
  );
};

export default AppProvider;
