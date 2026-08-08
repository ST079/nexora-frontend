import { queryFormatter } from "@/utils/format";
import api from ".";
import axios from "axios";
import { config } from "@/config/config";
import { ConstructionIcon } from "lucide-react";

export const getProducts = async (searchParams) => {
  const query = queryFormatter(searchParams);
  console.log("query", query);
  const response = await axios.get(`${config.apiUrl}api/v1/products?${query}`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${config.apiUrl}api/v1/products/${id}`);
  return response.data.productDetails;
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

export const getTotalCount = async () => {
  const response = await axios.get(`${config.apiUrl}api/v1/products/count`);
  return response.data;
};
