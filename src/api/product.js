import { queryFormatter } from "@/utils/format";
import api from ".";
import axios from "axios";
import { config } from "@/config/config";

export const getProducts = async (searchParams) => {
  const query = queryFormatter(await searchParams);
  const response = await axios.get(`${config.apiUrl}api/v1/products?${query}`);
  return response.data;
};

export const getProductById = async (product) => {
  const response = await api.get(`api/v1/${product._id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post(`api/v1/products`, data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`api/v1/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`api/v1/products/${id}`);
  console.log(response);
  return response.data;
};
