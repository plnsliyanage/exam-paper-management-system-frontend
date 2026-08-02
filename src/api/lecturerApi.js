import api from "./axios";

export const getDashboard = async (lecturerId) => {
  const response = await api.get(`/lecturer/${lecturerId}/dashboard`);
  return response.data;
};