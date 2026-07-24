import { config } from "@/config/config";
import { queryFormatter } from "@/utils/format";
import axios from "axios";

export const getProducts = async (searchParams) => {
  const query = queryFormatter(await searchParams);

  const response = await axios.get(`${config.apiUrl}api/v1/products?${query}`);

  return response.data;
};

export const getProductById = async (product) => {
  const response = await axios.get(`${config.apiUrl}api/v1/${product._id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const authToken = localStorage.getItem("authToken");
  const response = await axios.post(`${config.apiUrl}api/v1/products`, data, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
};

export const updateProduct = async (id, data) => {
  const authToken = localStorage.getItem("authToken");
  console.log([...data.entries()]);
  const response = await axios.put(
    `${config.apiUrl}api/v1/products/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  return response.data;
};

export const deleteProduct = async (id) => {
  const authToken = localStorage.getItem("authToken");
  const response = await axios.delete(`${config.apiUrl}api/v1/products/${id}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  console.log(response);
  return response.data;
};
