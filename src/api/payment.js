import api from ".";

export const paymentStatusCheck = async (id) => {
  const response = await api.get(`api/v1/payments/${id}/status`);
  return response.data;
};
