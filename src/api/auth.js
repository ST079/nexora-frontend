import { config } from "@/config/config";
import axios from "axios";

const apiUrl = config.apiUrl;
export const login = async ({ email, password }) => {
  const response = await axios.post(`${apiUrl}api/v1/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const signUp = async ({
  name,
  phone,
  email,
  password,
  city,
  street,
  province,
  country,
}) => {
  const response = await axios.post(`${apiUrl}api/v1/auth/register`, {
    name,
    phone,
    email,
    password,
    address: {
      city,
      street,
      province,
      country,
    },
  });

  console.log("api response", response);
  return response.data;
};
