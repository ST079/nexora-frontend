import { queryFormatter } from "@/utils/format";
import api from ".";
import axios from "axios";
import { config } from "@/config/config";

export const getProducts = async (searchParams) => {
  const query = queryFormatter(await searchParams);
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
  return response.data;
};

export const getTotalCount = async (searchParams = {}) => {
  const query = queryFormatter(await searchParams);
  const response = await axios.get(
    `${config.apiUrl}api/v1/products/count?${query}`,
  );
  return response.data;
};

// TF-IDF + cosine similarity on the backend; each product carries `similarity`.
export const getSimilarProducts = async (id, limit = 4) => {
  const response = await axios.get(
    `${config.apiUrl}api/v1/products/${id}/similar?limit=${limit}`,
  );
  return response.data;
};

// Apriori rules from past orders; each product carries `orders` and `confidence`.
export const getBoughtTogether = async (id, limit = 4) => {
  const response = await axios.get(
    `${config.apiUrl}api/v1/products/${id}/bought-together?limit=${limit}`,
  );
  return response.data;
};

// Exponential-smoothing forecast; merchants get their own products only.
export const getRestockForecast = async (searchParams = {}) => {
  const query = queryFormatter(await searchParams);
  const response = await api.get(`api/v1/products/restock-forecast?${query}`);
  return response.data;
};
