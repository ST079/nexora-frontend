import { queryFormatter } from "@/utils/format";
import api from ".";
import axios from "axios";
import { config } from "@/config/config";

export const createOrder = async (data) => {
  const response = await api.post(`api/v1/orders`, data);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(`api/v1/orders/my-orders`);
  console.log("Api ", response);
  return response.data;
};

export const getAllOrders = async (searchParams) => {
  const query = queryFormatter(await searchParams);
  const response = await api.get(`api/v1/orders?${query}`);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`api/v1/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`api/v1/orders/${id}/status`, {
    status,
  });
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await api.put(`api/v1/orders/${id}/cancel`);
  return response.data;
};

export const payViaKhalti = async (id) => {
  const response = await api.post(`api/v1/orders/${id}/payment/khalti`);
  return response.data;
};

export const payViaStripe = async (id) => {
  const response = await api.post(`api/v1/orders/${id}/payment/stripe`);
  return response.data;
};

export const confirmPayment = async (id, status) => {
  const response = await api.put(`api/v1/orders/${id}/confirm-payment`, {
    status,
  });
  return response.data;
};

export const payViaCash = async (id) => {
  const response = await api.post(`api/v1/orders/${id}/payment/cash`);
  return response.data;
};

export const getTotalCount = async () => {
  const response = await api.get(`api/v1/orders/count`);
  return response.data;
};
