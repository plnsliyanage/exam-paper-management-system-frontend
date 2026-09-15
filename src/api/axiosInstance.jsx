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
  const urlHasCycle = typeof config.url === "string" && (config.url.includes("cycleId=") || config.url.includes("cycleId"));
  const paramsHasCycle = config.params && Boolean(config.params.cycleId);
  if (cycleId && !urlHasCycle && !paramsHasCycle && !config.url?.startsWith("/auth") && !config.url?.startsWith("/cycles")) {
    config.params = { ...config.params, cycleId };
  }
  return config;
});

export default axiosInstance;