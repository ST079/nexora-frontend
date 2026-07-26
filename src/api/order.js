import api from ".";

export const createOrder = async (data) => {
  const response = await api.post(`api/v1/orders`, data);
  return response.data;
};