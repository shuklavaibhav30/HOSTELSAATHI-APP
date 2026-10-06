import axiosInstance from './axiosInstance';

export const loginStudent = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const registerStudent = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const sendOtp = async (email) => {
  const response = await axiosInstance.post('/otp/send-otp', { email });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await axiosInstance.post('/otp/verify-otp', { email, otp });
  return response.data;
};

export const forgotPasswordSendOtp = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password/send-otp', { email });
  return response.data;
};

export const forgotPasswordVerifyOtp = async (email, otp) => {
  const response = await axiosInstance.post('/auth/forgot-password/verify-otp', { email, otp });
  return response.data;
};

export const resetPassword = async (email, newPassword) => {
  const response = await axiosInstance.post('/auth/reset-password', { email, newPassword });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const updateAccountDetails = async (data) => {
  const response = await axiosInstance.patch('/auth/update-account', data);
  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error) {
    // Ignore error on logout if token already invalid
    return { success: true };
  }
};
