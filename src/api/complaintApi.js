import axiosInstance from './axiosInstance';

export const createComplaint = async (formData) => {
  const response = await axiosInstance.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getStudentComplaints = async (params = {}) => {
  const response = await axiosInstance.get('/complaints', { params });
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await axiosInstance.get(`/complaints/${id}`);
  return response.data;
};
