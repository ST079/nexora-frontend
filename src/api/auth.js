import api from ".";

export const login = async ({ email, password }) => {
  const response = await api.post(`api/v1/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const signUp = async ({
  name,
  phone,
  email,
  password,
  city,
  street,
  province,
  country,
}) => {
  const response = await api.post(`api/v1/auth/register`, {
    name,
    phone,
    email,
    password,
    // Empty strings would fail the backend's required checks; leaving them
    // out lets `country` fall back to its "Nepal" default.
    address: {
      city,
      street: street || undefined,
      province,
      country: country || undefined,
    },
  });
  return response.data;
};

export const forgotPassword = async ({ email }) => {
  const response = await api.post(`api/v1/auth/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async ({ userId, token, password }) => {
  const response = await api.post(`api/v1/auth/reset-password`, { password }, {
    params: { userId, token },
  });
  return response.data;
};
