import { queryFormatter } from "@/utils/format";
import api from ".";

export const createOrder = async (data) => {
  const response = await api.post(`api/v1/orders`, data);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(`api/v1/orders/my-orders`);
  return response.data;
};

export const getAllOrders = async (searchParams) => {
  const query = queryFormatter(await searchParams);
  const response = await api.get(`api/v1/orders?${query}`);
  return response.data;
};

// Orders containing the merchant's products; each order's items are trimmed
// to the merchant's own lines and carry a `merchantTotal`.
export const getMerchantOrders = async (searchParams) => {
  const query = queryFormatter(await searchParams);
  const response = await api.get(`api/v1/orders/merchant?${query}`);
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

export const deleteOrder = async (id) => {
  const response = await api.delete(`api/v1/orders/${id}`);
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

// The backend verifies the payment with Khalti/Stripe itself; Khalti
// payments also need the `pidx` returned to the callback URL.
export const confirmPayment = async (id, { pidx } = {}) => {
  const response = await api.put(`api/v1/orders/${id}/confirm-payment`, {
    pidx,
  });
  return response.data;
};

export const payViaCash = async (id) => {
  const response = await api.post(`api/v1/orders/${id}/payment/cash`);
  return response.data;
};

export const getTotalCount = async (searchParams = {}) => {
  const query = queryFormatter(await searchParams);
  const response = await api.get(`api/v1/orders/count?${query}`);
  return response.data;
};

// { total, byStatus: { PENDING, CONFIRMED, ... }, revenue } scoped to the
// caller's role (admins see everything, merchants their own lines).
export const getOrderStats = async () => {
  const response = await api.get(`api/v1/orders/stats`);
  return response.data;
};
