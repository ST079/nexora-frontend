import api from ".";

export const createOrder = async (data) => {
  const response = await api.post(`api/v1/orders`, data);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(`api/v1/orders/my-orders`);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`api/v1/orders/${id}`);
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await api.put(`api/v1/orders/${id}/cancel`);
  return response.data;
};
