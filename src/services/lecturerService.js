import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const getDashboard = async (lecturerId) => {
  const response = await API.get("/packets/dashboard", {
    params: {
      lecturerId,
    },
  });

  return response.data;
};

export const getAssignedPackets = async (lecturerId) => {
  const response = await API.get("/packets/dashboard/current", {
    params: {
      lecturerId,
    },
  });

  return response.data;
};