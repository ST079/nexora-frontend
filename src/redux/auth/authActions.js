import { login, signUp } from "@/api/auth";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await login(data);
      localStorage.setItem("authToken", response.token);
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Invalid credentials",
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await signUp(data);
      localStorage.setItem("authToken", response.token);
      return response;
    } catch (error) {
      const errorData = error.response?.data;
      let message = errorData?.message;
      if (errorData?.properties) {
        const firstError = Object.values(errorData.properties)
          .flatMap((field) => field.errors)
          .find(Boolean);

        if (firstError) {
          message = firstError;
        }
      }
      return rejectWithValue(message);
    }
  },
);
