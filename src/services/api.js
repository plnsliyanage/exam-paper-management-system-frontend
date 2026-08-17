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

  // ----------------------------------------------------------
  // Dashboard
  // ----------------------------------------------------------

  getDashboard: (lecturerId) =>
    api.get(`/lecturer/${lecturerId}/dashboard`),

  // ----------------------------------------------------------
  // Assigned packets
  // ----------------------------------------------------------

  getPackets: (lecturerId) =>
    api.get(`/lecturer/${lecturerId}/packets`),

  // ----------------------------------------------------------
  // Packet details
  //
  // Backend:
  // GET /api/lecturer/packets/{packetId}
  // ----------------------------------------------------------

  getPacketDetails: (packetId) =>
    api.get(
      `/lecturer/packets/${encodeURIComponent(packetId)}`
    ),

  // ----------------------------------------------------------
  // Movement history
  //
  // IMPORTANT:
  // Backend controller is:
  //
  // @RequestMapping("/api/lecturer")
  // @GetMapping("/{packetId}/movements")
  //
  // Therefore:
  // /api/lecturer/P1/movements
  //
  // NOT:
  // /api/lecturer/packets/P1/movements
  // ----------------------------------------------------------

  getMovementHistory: (packetId) =>
    api.get(
      `/lecturer/${encodeURIComponent(packetId)}/movements`
    ),

  // ----------------------------------------------------------
  // Previous packets
  // ----------------------------------------------------------

  getPreviousPackets: () =>
    api.get("/lecturer/packets/previous"),

  // ----------------------------------------------------------
  // Search packets
  // ----------------------------------------------------------

  searchPackets: (keyword) =>
    api.get("/lecturer/packets/search", {
      params: {
        keyword,
      },
    }),

  // ----------------------------------------------------------
  // Assigned packet count
  // ----------------------------------------------------------

  getAssignedPacketCount: (lecturerId) =>
    api.get(
      `/lecturer/${encodeURIComponent(
        lecturerId
      )}/assigned-packets/count`
    ),

  // ----------------------------------------------------------
  // Marking
  // ----------------------------------------------------------

  addMarkingScripts: (data) =>
    api.post("/lecturer/marking", data),

  getMarkingByPacketId: (packetId) =>
    api.get(
      `/lecturer/marking/${encodeURIComponent(packetId)}`
    ),

  // ----------------------------------------------------------
  // Status
  // ----------------------------------------------------------

  updateStatus: (packetId, data) =>
    api.put(
      `/lecturer/packets/${encodeURIComponent(
        packetId
      )}/status`,
      data
    ),

  // ----------------------------------------------------------
  // Complete task
  // ----------------------------------------------------------

  completeTask: (packetId) =>
    api.put(
      `/lecturer/tasks/${encodeURIComponent(
        packetId
      )}/complete`
    ),

  // ----------------------------------------------------------
  // Comments
  // ----------------------------------------------------------

  addComment: (data) =>
    api.post("/lecturer/comments", data),

  getComments: (packetId) =>
    api.get(
      `/lecturer/comments/${encodeURIComponent(packetId)}`
    ),

  // ----------------------------------------------------------
  // Workload
  // ----------------------------------------------------------

  getWorkloadStats: (lecturerId) =>
    api.get(
      `/lecturer/${encodeURIComponent(
        lecturerId
      )}/workload-statistics`
    ),

  // ----------------------------------------------------------
  // Calendar
  // ----------------------------------------------------------

  getDeadlineCalendar: (lecturerId) =>
    api.get(
      `/lecturer/${encodeURIComponent(
        lecturerId
      )}/deadline-calendar`
    ),

  // ----------------------------------------------------------
  // Printing schedules
  // ----------------------------------------------------------

  getPrintingSchedules: (lecturerId) =>
    api.get(
      `/lecturer/${encodeURIComponent(
        lecturerId
      )}/printing-schedules`
    ),

    addComment: (data) =>
  api.post("/lecturer/comments", data),

getComments: (packetId) =>
  api.get(
    `/lecturer/comments/${encodeURIComponent(packetId)}`
  ),

  // ----------------------------------------------------------
  // Notifications
  // ----------------------------------------------------------

  getNotifications: (userId) =>
    api.get(
      `/lecturer/${encodeURIComponent(
        userId
      )}/notifications`
    ),

  markNotificationAsRead: (
    userId,
    notificationId
  ) =>
    api.put(
      `/lecturer/${encodeURIComponent(
        userId
      )}/notifications/${encodeURIComponent(
        notificationId
      )}/read`
    ),

  markAllNotificationsAsRead: (userId) =>
    api.put(
      `/lecturer/${encodeURIComponent(
        userId
      )}/notifications/read-all`
    ),
};

// ============================================================
// HOD API
// ============================================================

export const hodApi = {

  getDepartmentPackets: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/packets`
    ),

  searchPackets: (deptId, params) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/packets/search`,
      {
        params,
      }
    ),

  getPacketDetails: (packetId) =>
    api.get(
      `/hod/packet/${encodeURIComponent(packetId)}`
    ),

  getPreviousRecords: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/previous-records`
    ),

  getOverduePackets: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/overdue`
    ),

  getWorkload: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/workload`
    ),

  addComment: (data) =>
    api.post("/hod/comment", data),

  getComments: (packetId) =>
    api.get(
      `/hod/packet/${encodeURIComponent(
        packetId
      )}/comments`
    ),

  getReport: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/report`
    ),

  exportExcel: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/report/export/excel`,
      {
        responseType: "blob",
      }
    ),

  exportPdf: (deptId) =>
    api.get(
      `/hod/department/${encodeURIComponent(
        deptId
      )}/report/export/pdf`,
      {
        responseType: "blob",
      }
    ),
};

export default api;