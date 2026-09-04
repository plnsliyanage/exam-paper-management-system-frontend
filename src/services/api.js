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
    api.get("/packets"),

  // Assigned packets
  getPackets: (lecturerId) =>
    api.get("/packets"),

  // Packet details
  getPacketDetails: (packetId) => {
    const id = typeof packetId === "string" && packetId.includes("-")
      ? parseInt(packetId.split("-")[2], 10)
      : packetId;
    return api.get(`/packets/${id}`);
  },

  // Movement history
  getMovementHistory: (packetId) => {
    const id = typeof packetId === "string" && packetId.includes("-")
      ? parseInt(packetId.split("-")[2], 10)
      : packetId;
    return api.get(`/packets/${id}/history`);
  },

  // Previous packets
  getPreviousPackets: () =>
    api.get("/packets"),

  // Search packets
  searchPackets: (keyword) =>
    api.get("/packets"),

  // Assigned packet count
  getAssignedPacketCount: (lecturerId) =>
    api.get("/packets").then(res => ({ data: { count: (res.data || []).length } })),

  // Add marking scripts
  addMarkingScripts: (data) =>
    Promise.resolve({ data: { success: true } }),

  // Get marking by packet
  getMarkingByPacketId: (packetId) =>
    Promise.resolve({ data: { totalScripts: 0 } }),

  // Update packet status
  updateStatus: (packetId, data) => {
    const id = typeof packetId === "string" && packetId.includes("-")
      ? parseInt(packetId.split("-")[2], 10)
      : packetId;
    return api.put(`/packets/${id}/status`, data);
  },

  // Complete / Submit task
  completeTask: (packetId, action = "SUBMIT") => {
    const id = typeof packetId === "string" && packetId.includes("-")
      ? parseInt(packetId.split("-")[2], 10)
      : packetId;
    return api.put(`/packets/${id}/status`, { action });
  },

  // Add comment
  addComment: (data) => {
    const id = typeof data.packetId === "string" && data.packetId.includes("-")
      ? parseInt(data.packetId.split("-")[2], 10)
      : data.packetId;
    return api.post(`/packets/${id}/comments`, {
      comment: data.commentText || data.comment || "",
    });
  },

  // Get comments
  getComments: (packetId) => {
    const id = typeof packetId === "string" && packetId.includes("-")
      ? parseInt(packetId.split("-")[2], 10)
      : packetId;
    return api.get(`/packets/${id}/comments`);
  },

  // Workload statistics
  getWorkloadStats: (lecturerId) =>
    api.get("/packets").then(res => {
      const packets = res.data || [];
      return {
        data: {
          totalAssignedPackets: packets.length,
          completedPackets: packets.filter(p => p.status === "COMPLETED").length,
          overduePackets: packets.filter(p => p.overdue).length,
          totalScripts: 0,
        }
      };
    }),

  // Deadline calendar
  getDeadlineCalendar: (lecturerId) =>
    api.get("/packets"),

  // Printing schedules
  getPrintingSchedules: (lecturerId) =>
    api.get("/packets"),

  // Notifications
  getNotifications: (userId) =>
    api.get("/notifications"),

  // Mark notification as read
  markNotificationAsRead: (userId, notificationId) =>
    api.put(`/notifications/${notificationId}/read`),

  // Mark all notifications as read
  markAllNotificationsAsRead: (userId) =>
    api.put("/notifications/read-all"),
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
