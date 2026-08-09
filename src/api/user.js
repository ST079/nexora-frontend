import api from ".";

export const updateUser = async (id, data) => {
  const response = await api.put(`/api/v1/users/${id}/update-profile`, data);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get(`/api/v1/users`);

  return response.data;
};

export const getMe = async () => {
  const response = await api.get(`/api/v1/users/me`);

  return response.data;
};

export const updateProfileImage = async (data) => {
  console.log("data", data);
  const response = await api.patch(`/api/v1/users/profile-image`, data);
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
