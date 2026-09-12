import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const cycleId = localStorage.getItem("selectedCycleId");
  if (cycleId && (!config.params || !config.params.cycleId) && !config.url?.startsWith("/auth") && !config.url?.startsWith("/cycles")) {
    config.params = { ...config.params, cycleId };
  }
  return config;
});

export default axiosInstance;