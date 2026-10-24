import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import rootReducer from "./rootReducer";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createTransform,
  persistReducer,
  persistStore,
} from "redux-persist";
import { AUTH_TOKEN_KEY } from "@/api";
import { logout } from "./auth/authSlice";

// Request flags and the drawer state are UI-only. Without this a reload
// mid-login restores `loading: true` forever, or reopens the cart drawer.
const resetAuthFlags = createTransform(
  (inbound) => inbound,
  (outbound) => ({ ...outbound, loading: false, error: null }),
  { whitelist: ["auth"] },
);

const resetCartDrawer = createTransform(
  (inbound) => inbound,
  (outbound) => ({ ...outbound, isOpen: false }),
  { whitelist: ["cart"] },
);

const persistConfig = {
  key: "root",
  storage,
  transforms: [resetAuthFlags, resetCartDrawer],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Side effects stay out of reducers: clear the stored token whenever we log out.
const listener = createListenerMiddleware();
listener.startListening({
  actionCreator: logout,
  effect: () => localStorage.removeItem(AUTH_TOKEN_KEY),
});

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(listener.middleware),
});

const persistor = persistStore(store);

export { store, persistor };

