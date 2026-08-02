import api from "./axios";

/* Dashboard */
export const getDashboard = async (lecturerId) => {
  const response = await api.get(`/lecturer/${lecturerId}/dashboard`);
  return response.data;
};

/* Assigned Packets */
export const getAssignedPackets = async (lecturerId) => {
  const response = await api.get(`/lecturer/${lecturerId}/packets`);
  return response.data;
};