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

export const getPacketDetails = async (packetId) => {
  const response = await api.get(`/lecturer/packets/${packetId}`);
  return response.data;
};

export const addMarkingScripts = async (markingData) => {

  const response = await api.post(
    "/lecturer/marking",
    markingData
  );

  return response.data;

};