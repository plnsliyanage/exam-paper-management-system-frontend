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
      config.headers.Authorization = "Bearer " + token;
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
  // Dashboard
  getDashboard: (lecturerId) =>
    api.get(`/lecturer/${lecturerId}/dashboard`),

  // Assigned packets
  getPackets: (lecturerId) =>
    api.get(`/lecturer/${lecturerId}/packets`),

  // Packet details
  getPacketDetails: (packetId) =>
    api.get(`/lecturer/packets/${packetId}`),

  // Movement history
  getMovementHistory: (packetId) =>
    api.get(`/lecturer/${packetId}/movements`),

  // Previous packets
  getPreviousPackets: () =>
    api.get("/lecturer/packets/previous"),

  // Search packets
  searchPackets: (keyword) =>
    api.get("/lecturer/packets/search", {
      params: { keyword },
    }),

  // Assigned packet count
  getAssignedPacketCount: (lecturerId) =>
    api.get(`/lecturer/${lecturerId}/assigned-packets/count`),

  // Add marking scripts
  addMarkingScripts: (data) =>
    api.post("/lecturer/marking", data),

  // Get marking by packet
  getMarkingByPacketId: (packetId) =>
    api.get(`/lecturer/marking/${packetId}`),

  // Update packet status
  updateStatus: (packetId, data) =>
    api.put(`/lecturer/packets/${packetId}/status`, data),

  // Complete task
  completeTask: (packetId) =>
    api.put(`/lecturer/tasks/${packetId}/complete`),

  // Add comment
  addComment: (data) =>
    api.post("/lecturer/comments", data),

  // Get comments
  getComments: (packetId) =>
    api.get(`/lecturer/comments/${packetId}`),

  // Workload statistics
  getWorkloadStats: (lecturerId) =>
    api.get(`/lecturer/${lecturerId}/workload-statistics`),

  // Deadline calendar
  getDeadlineCalendar: (lecturerId) =>
    api.get(`/lecturer/${lecturerId}/deadline-calendar`),

  // Printing schedules
  getPrintingSchedules: (lecturerId) =>
    api.get(`/lecturer/${lecturerId}/printing-schedules`),

  // Notifications
  getNotifications: (userId) =>
    api.get(`/lecturer/${userId}/notifications`),

  // Mark notification as read
  markNotificationAsRead: (userId, notificationId) =>
    api.put(`/lecturer/${userId}/notifications/${notificationId}/read`),

  // Mark all notifications as read
  markAllNotificationsAsRead: (userId) =>
    api.put(`/lecturer/${userId}/notifications/read-all`),
};

// ============================================================
// HOD API
// ============================================================

export const hodApi = {
  // All Department Packets
  getDepartmentPackets: (deptId) =>
    api.get(`/hod/department/${deptId}/packets`),

  // Department Statistics
  getDepartmentStatistics: (deptId) =>
    api.get(`/hod/department/${deptId}/statistics`),

  // Search / Filter Packets
  searchPackets: (deptId, { query, status, cycleId, lecturerId } = {}) =>
    api.get(`/hod/department/${deptId}/packets/search`, {
      params: {
        query,
        status,
        cycleId,
        lecturerId,
      },
    }),

  // Packet Details
  getPacketDetails: (packetId) =>
    api.get(`/hod/packet/${packetId}`),

  // Comments
  getPacketComments: (packetId) =>
    api.get(`/hod/packet/${packetId}/comments`),

  getComments: (packetId) =>
    api.get(`/hod/packet/${packetId}/comments`),

  // Add Comment
  addComment: (payload) =>
    api.post("/hod/comment", payload),

  // Workload
  getDepartmentWorkload: (deptId) =>
    api.get(`/hod/department/${deptId}/workload`),

  getWorkload: (deptId) =>
    api.get(`/hod/department/${deptId}/workload`),

  // Overdue Packets
  getOverduePackets: (deptId) =>
    api.get(`/hod/department/${deptId}/overdue`),

  // Previous Cycle Records
  getPreviousRecords: (deptId) =>
    api.get(`/hod/department/${deptId}/previous-records`),

  // Department Report
  getDepartmentReport: (deptId) =>
    api.get(`/hod/department/${deptId}/report`),

  // Export Report
  exportReport: (deptId, format) =>
    api.get(
      `/hod/department/${deptId}/report/export/${
        format === "excel" ? "excel" : "pdf"
      }`,
      {
        responseType: "blob",
      }
    ),
};

export default api;
