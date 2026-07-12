import api from "./api";

// ============ BOOKINGS ============
export const bookingAPI = {
  createBooking: (data) => api.post("/bookings", data),
  getBookings: (params) => api.get("/bookings", { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
  checkAvailability: (params) => api.get("/bookings/check-availability", { params }),
};

// ============ NOTIFICATIONS ============
export const notificationAPI = {
  getNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread/count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// ============ REPORTS ============
export const reportsAPI = {
  getDashboardAnalytics: () => api.get("/reports/dashboard-analytics"),
  getAssetUtilization: (params) => api.get("/reports/asset-utilization", { params }),
  getDepartmentAssets: () => api.get("/reports/department-assets"),
  getMaintenanceReport: (params) => api.get("/reports/maintenance", { params }),
  getAuditTrail: (params) => api.get("/reports/audit-trail", { params }),
  getAssetAllocationHistory: (assetId) => api.get(`/reports/asset/${assetId}/allocation-history`),
  getChartData: (params) => api.get("/reports/chart-data", { params }),
};

export default { bookingAPI, notificationAPI, reportsAPI };
