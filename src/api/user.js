import { queryFormatter } from "@/utils/format";
import api from ".";

export const createUser = async (data) => {
  const response = await api.post(`/api/v1/users`, data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/api/v1/users/${id}/update-profile`, data);
  return response.data;
};

export const getAllUsers = async (searchParams) => {
  const query = queryFormatter(await searchParams);
  const response = await api.get(`/api/v1/users?${query}`);

  return response.data;
};

export const getMe = async () => {
  const response = await api.get(`/api/v1/users/me`);

  return response.data;
};

export const updateProfileImage = async (data) => {
  const response = await api.patch(`/api/v1/users/profile-image`, data);
  return response.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.patch(`/api/v1/users/change-password`, {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const updateUserRoles = async (id, roles) => {
  const response = await api.patch(`/api/v1/users/${id}/roles`, { roles });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/v1/users/${id}`);
  return response.data;
};

export const getTotalCount = async (searchParams = {}) => {
  const query = queryFormatter(await searchParams);
  const response = await api.get(`api/v1/users/count?${query}`);
  return response.data;
};

// { total, active, inactive, admins, merchants }
export const getUserStats = async () => {
  const response = await api.get(`api/v1/users/stats`);
  return response.data;
};
