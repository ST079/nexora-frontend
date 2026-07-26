import api from ".";

export const createOrder = async (data) => {
  const response = await api.post(`api/v1/orders`, data);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(`api/v1/orders/my-orders`);
  console.log(response)
  return response.data;
};