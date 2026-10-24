"use client"

import { config } from "@/config/config";
import axios from "axios";

export const AUTH_TOKEN_KEY = "authToken";
export const UNAUTHORIZED_EVENT = "nexora:unauthorized";

const api = axios.create({
  baseURL: config.apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const authToken =
      typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// The backend only answers 401 when the token is missing, expired or invalid,
// so a 401 on an authenticated request means the stored session is dead.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const sentToken = Boolean(error.config?.headers?.Authorization);
    if (
      error.response?.status === 401 &&
      sentToken &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

export default api;
