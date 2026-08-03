import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- LECTURER ENDPOINTS ---
export const lecturerApi = {
  getDashboard: (lecturerId) => api.get(`/lecturer/${lecturerId}/dashboard`),
  getPackets: (lecturerId) => api.get(`/lecturer/${lecturerId}/packets`),
  getPacketDetails: (packetId) => api.get(`/lecturer/packets/${packetId}`),
  addMarkingScripts: (data) => api.post('/lecturer/marking', data),
  getPreviousPackets: (lecturerId) => api.get(`/lecturer/${lecturerId}/packets/previous`),
  getMovementHistory: (packetId) => api.get(`/lecturer/packets/${packetId}/movements`),
  updateStatus: (packetId, data) => api.put(`/lecturer/packets/${packetId}/status`, data),
  completeTask: (packetId) => api.put(`/lecturer/tasks/${packetId}/complete`),
  addComment: (data) => api.post('/lecturer/comments', data),
  getComments: (packetId) => api.get(`/lecturer/comments/${packetId}`),
  searchPackets: (keyword) => api.get(`/lecturer/packets/search?keyword=${keyword}`),
  getWorkloadStats: (lecturerId) => api.get(`/lecturer/${lecturerId}/workload-statistics`),
  getDeadlineCalendar: (lecturerId) => api.get(`/lecturer/${lecturerId}/deadline-calendar`),
  getPrintingSchedules: (lecturerId) => api.get(`/lecturer/${lecturerId}/printing-schedules`),
  getNotifications: (userId) => api.get(`/lecturer/${userId}/notifications`),
};

// --- HOD ENDPOINTS ---
export const hodApi = {
  getDepartmentPackets: (deptId) => api.get(`/hod/department/${deptId}/packets`),
  searchPackets: (deptId, params) => api.get(`/hod/department/${deptId}/packets/search`, { params }),
  getPacketDetails: (packetId) => api.get(`/hod/packet/${packetId}`),
  getPreviousRecords: (deptId) => api.get(`/hod/department/${deptId}/previous-records`),
  getOverduePackets: (deptId) => api.get(`/hod/department/${deptId}/overdue`),
  getWorkload: (deptId) => api.get(`/hod/department/${deptId}/workload`),
  addComment: (data) => api.post('/hod/comment', data),
  getComments: (packetId) => api.get(`/hod/packet/${packetId}/comments`),
  getReport: (deptId) => api.get(`/hod/department/${deptId}/report`),
  exportExcel: (deptId) => api.get(`/hod/department/${deptId}/report/export/excel`, { responseType: 'blob' }),
  exportPdf: (deptId) => api.get(`/hod/department/${deptId}/report/export/pdf`, { responseType: 'blob' }),
};

export const arApi = {
  getOverview: () => api.get('/ar/overview'),
  getAllPackets: (params) => api.get('/ar/packets', { params }), // supports search/filters
  getAttentionPackets: () => api.get('/ar/packets/attention'),
  updateStatus: (packetId, status, arUserId) => 
    api.put(`/ar/packets/${packetId}/status`, null, { params: { status, arUserId } }),
  assignUser: (packetId, data, arUserId) => api.put(`/ar/packets/${packetId}/assign`, data, { params: { arUserId } }),
  getApprovedForPrinting: () => api.get('/ar/printing/approved'),
  schedulePrinting: (data, arUserId) => api.post('/ar/printing/schedule', data, { params: { arUserId } }),
  getPrintingSchedules: () => api.get('/ar/printing/schedules'),
  createUser: (data, arUserId) => api.post('/ar/users', data, { params: { arUserId } }),
  getAuditLogs: () => api.get('/ar/logs'),
  generateReport: (type, format) => api.get(`/ar/reports/generate`, { params: { type, format }, responseType: 'blob' }),
};

export default api;