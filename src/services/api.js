import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// JWT TOKEN
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE ERROR LOGGING
// ============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

// ============================================================
// LECTURER API
// ============================================================

export const lecturerApi = {
  getDashboard: (lecturerId) =>
    api.get(`/lecturer/${encodeURIComponent(lecturerId)}/dashboard`),

  getPackets: (lecturerId) =>
    api.get(`/lecturer/${encodeURIComponent(lecturerId)}/packets`),

  getPacketDetails: (packetId) =>
    api.get(`/lecturer/packets/${encodeURIComponent(packetId)}`),

  getMovementHistory: (packetId) =>
    api.get(`/lecturer/${encodeURIComponent(packetId)}/movements`),

  getPreviousPackets: () =>
    api.get("/lecturer/packets/previous"),

  searchPackets: (keyword) =>
    api.get("/lecturer/packets/search", {
      params: { keyword },
    }),

  getAssignedPacketCount: (lecturerId) =>
    api.get(
      `/lecturer/${encodeURIComponent(lecturerId)}/assigned-packets/count`
    ),

  addMarkingScripts: (data) =>
    api.post("/lecturer/marking", data),

  getMarkingByPacketId: (packetId) =>
    api.get(`/lecturer/marking/${encodeURIComponent(packetId)}`),

  updateStatus: (packetId, data) =>
    api.put(
      `/lecturer/packets/${encodeURIComponent(packetId)}/status`,
      data
    ),

  completeTask: (packetId) =>
    api.put(
      `/lecturer/tasks/${encodeURIComponent(packetId)}/complete`
    ),

  addComment: (data) =>
    api.post("/lecturer/comments", data),

  getComments: (packetId) =>
    api.get(`/lecturer/comments/${encodeURIComponent(packetId)}`),

  getWorkloadStats: (lecturerId) =>
    api.get(
      `/lecturer/${encodeURIComponent(lecturerId)}/workload-statistics`
    ),

  getDeadlineCalendar: (lecturerId) =>
    api.get(
      `/lecturer/${encodeURIComponent(lecturerId)}/deadline-calendar`
    ),

  getPrintingSchedules: (lecturerId) =>
    api.get(
      `/lecturer/${encodeURIComponent(lecturerId)}/printing-schedules`
    ),

  getNotifications: (userId) =>
    api.get(
      `/lecturer/${encodeURIComponent(userId)}/notifications`
    ),

  markNotificationAsRead: (userId, notificationId) =>
    api.put(
      `/lecturer/${encodeURIComponent(
        userId
      )}/notifications/${encodeURIComponent(notificationId)}/read`
    ),

  markAllNotificationsAsRead: (userId) =>
    api.put(
      `/lecturer/${encodeURIComponent(userId)}/notifications/read-all`
    ),
};

// ============================================================
// HOD API
// ============================================================

export const hodApi = {
  // ----------------------------------------------------------
  // ALL DEPARTMENT PACKETS
  // GET /api/hod/department/{deptId}/packets
  // ----------------------------------------------------------

  getDepartmentPackets: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(deptId)}/packets`
    ),

  // ----------------------------------------------------------
  // SEARCH / FILTER
  // GET /api/hod/department/{deptId}/packets/search
  // ----------------------------------------------------------

  searchPackets: (deptId, params = {}) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/packets/search`,
      {
        params,
      }
    ),

  // ----------------------------------------------------------
  // PACKET DETAILS
  // GET /api/hod/packet/{packetId}
  // ----------------------------------------------------------

  getPacketDetails: (packetId) =>
    api.get(
      `/hod/packet/${encodeURIComponent(packetId)}`
    ),

  // ----------------------------------------------------------
  // DEPARTMENT STATISTICS
  // GET /api/hod/department/{deptId}/statistics
  // ----------------------------------------------------------

  getDepartmentStatistics: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/statistics`
    ),

  // ----------------------------------------------------------
  // PREVIOUS RECORDS
  // GET /api/hod/department/{deptId}/previous-records
  // ----------------------------------------------------------

  getPreviousRecords: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/previous-records`
    ),

  // ----------------------------------------------------------
  // OVERDUE PACKETS
  // GET /api/hod/department/{deptId}/overdue
  // ----------------------------------------------------------

  getOverduePackets: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/overdue`
    ),

  // ----------------------------------------------------------
  // WORKLOAD
  // GET /api/hod/department/{deptId}/workload
  // ----------------------------------------------------------

  getWorkload: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/workload`
    ),

  // ----------------------------------------------------------
  // COMMENTS
  // ----------------------------------------------------------

  addComment: (data) =>
    api.post("/hod/comment", data),

  getComments: (packetId) =>
    api.get(
      `/hod/packet/${encodeURIComponent(
        packetId
      )}/comments`
    ),
};

export default api;