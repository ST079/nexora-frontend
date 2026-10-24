import { login, signUp } from "@/api/auth";
import { AUTH_TOKEN_KEY } from "@/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Zod errors come back as { properties: { field: { errors: [...] } } };
// surface the first one instead of a generic "Invalid input".
const firstValidationError = (errorData) =>
  Object.values(errorData?.properties ?? {})
    .flatMap((field) => field.errors ?? [])
    .find(Boolean);

const errorMessage = (error, fallback) => {
  const errorData = error?.response?.data;
  return (
    firstValidationError(errorData) ||
    errorData?.message ||
    error?.message ||
    fallback
  );
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await login(data);
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      return response;
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Invalid credentials"));
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await signUp(data);
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      return response;
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, "We couldn't create your account. Try again."),
      );
    }
  },
);
