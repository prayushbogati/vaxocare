// Centralized API client for the frontend.
// Supports JWT auth + consistent JSON/error handling.

const BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

const buildHeaders = (extra = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...extra,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseJson = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const handleError = async (res) => {
  const data = await parseJson(res);
  const message =
    (data && (data.message || data.error)) ||
    `Request failed with status ${res.status}`;
  const err = new Error(message);
  err.status = res.status;
  err.data = data;
  throw err;
};

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(headers),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) return handleError(res);
  return parseJson(res);
}

export const api = {
  // Auth
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  me: () => request("/api/auth/me", { method: "GET" }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  updateProfile: (payload) => request("/api/auth/profile", { method: "PUT", body: payload }),

  // Children (parent)
  createChild: (payload) => request("/api/children", { method: "POST", body: payload }),
  listChildren: () => request("/api/children", { method: "GET" }),
  updateChild: (id, payload) => request(`/api/children/${id}`, { method: "PUT", body: payload }),
  deleteChild: (id) => request(`/api/children/${id}`, { method: "DELETE" }),

  // Parent vaccinations/scheduling
  getVaccinationsByChild: (childId) => request(`/api/vaccinations/${childId}`, { method: "GET" }),
  bookAppointment: (childId, payload) => request(`/api/vaccinations/book/${childId}`, { method: "PUT", body: payload }),
  rescheduleAppointment: (id, payload) => request(`/api/vaccinations/reschedule/${id}`, { method: "PUT", body: payload }),
  cancelAppointment: (id, payload) => request(`/api/vaccinations/cancel/${id}`, { method: "PUT", body: payload }),
  completeVaccination: (id) => request(`/api/vaccinations/complete/${id}`, { method: "PUT" }),
  getAvailableSlots: (date) => request(`/api/vaccinations/slots/${date}`, { method: "GET" }),

  // Vaccines catalog (provider/admin)
  listVaccines: () => request("/api/vaccines", { method: "GET" }),

  // Public config
  getPublicConfig: () => request("/api/public/config", { method: "GET" }),
  getPublicConfigByKey: (key) => request(`/api/public/config/${encodeURIComponent(key)}`, { method: "GET" }),

  // Provider dashboard
  providerChildren: () => request("/api/provider/children", { method: "GET" }),
  providerChildDetails: (id) => request(`/api/provider/children/${id}`, { method: "GET" }),
  providerChildVaccinations: (id) => request(`/api/provider/children/${id}/vaccinations`, { method: "GET" }),
  providerChildRisk: (id) => request(`/api/provider/children/${id}/risk`, { method: "GET" }),
  providerCompleteVaccination: (id, payload) => request(`/api/provider/vaccinations/${id}/complete`, { method: "PUT", body: payload }),
  providerCorrectRecord: (id, payload) => request(`/api/provider/vaccinations/${id}/correct`, { method: "PUT", body: payload }),

  providerTodayAppointments: () => request("/api/provider/appointments/today", { method: "GET" }),
  providerApproveAppointment: (id) => request(`/api/provider/appointments/${id}/approve`, { method: "PUT" }),
  providerRejectAppointment: (id, payload) => request(`/api/provider/appointments/${id}/reject`, { method: "PUT", body: payload }),
  providerRescheduleAppointment: (id, payload) => request(`/api/provider/appointments/${id}/reschedule`, { method: "PUT", body: payload }),

  providerDailySummary: () => request("/api/provider/daily-summary", { method: "GET" }),
  providerOverdue: () => request("/api/provider/overdue", { method: "GET" }),
  providerUpcoming: () => request("/api/provider/upcoming", { method: "GET" }),

  // Parent/provider selection (parent dashboard)
  listProvidersForParent: () => request("/api/provider-selection/providers", { method: "GET" }),
  getSelectedProvider: () => request("/api/provider-selection/selected-provider", { method: "GET" }),
  setSelectedProvider: async (providerId) => {
    // Use urlencoded body to avoid backend JSON body parsing quirks in some environments.
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const body = new URLSearchParams({ providerId }).toString();

    const res = await fetch(`${BASE_URL}/api/provider-selection/selected-provider`, {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    const txt = await res.text();
    if (!txt) return null;
    try {
      return JSON.parse(txt);
    } catch {
      return { message: txt };
    }
  },

  // Admin dashboard
  adminDashboardStats: () => request("/api/admin/dashboard", { method: "GET" }),
  adminAuditLogs: (page = 1, limit = 20) => request(`/api/admin/audit-logs?page=${page}&limit=${limit}`, { method: "GET" }),

  // User Management (admin)
  // Use admin routes (admin controller) for management actions
  adminAllUsers: () => request("/api/admin/all-users", { method: "GET" }),
  adminActivateUser: (id) => request(`/api/admin/users/${id}/activate`, { method: "POST" }),
  adminDeactivateUser: (id, payload) => request(`/api/admin/users/${id}/deactivate`, { method: "POST", body: payload }),
  adminUpdateUserRole: (id, payload) => request(`/api/admin/users/${id}/role`, { method: "PUT", body: payload }),
  adminResetUserPassword: (id, payload) => request(`/api/admin/users/${id}/reset-password`, { method: "POST", body: payload }),

  // Provider approval (admin)
  adminProvidersPending: () => request("/api/admin/users/providers/pending", { method: "GET" }),
  adminApproveProvider: (id) => request(`/api/admin/users/providers/${id}/approve`, { method: "PUT" }),
  adminRejectProvider: (id, payload) =>
    request(`/api/admin/users/providers/${id}/reject`, { method: "PUT", body: payload }),

  adminConfigAll: () => request("/api/admin/config", { method: "GET" }),
  adminConfigReset: () => request("/api/admin/config/reset", { method: "POST" }),
  adminConfigByKey: (key) => request(`/api/admin/config/${encodeURIComponent(key)}`, { method: "GET" }),
  adminUpdateConfig: (key, payload) => request(`/api/admin/config/${encodeURIComponent(key)}`, { method: "PUT", body: payload }),

  adminVaccinationHeatmap: () => request("/api/admin/heatmap", { method: "GET" }),
  adminRiskHeatmap: () => request("/api/admin/risk-heatmap", { method: "GET" }),

  // Exports
  adminExportVaccinations: (startDate, endDate) =>
    request(`/api/export/vaccinations?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, { method: "GET" }),
  adminExportChildren: () => request("/api/export/children", { method: "GET" }),
  adminExportHighRisk: () => request("/api/export/high-risk", { method: "GET" }),
  adminExportAuditLogs: (startDate, endDate) =>
    request(`/api/export/audit-logs?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, { method: "GET" }),
  adminExportMonthlyReport: (month) => request(`/api/export/report/monthly?month=${encodeURIComponent(month)}`, { method: "GET" }),
};

export const auth = {
  setToken: (token) => localStorage.setItem("token", token),
  clearToken: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  },
  getToken: () => localStorage.getItem("token"),
  setRole: (role) => localStorage.setItem("role", role),
  getRole: () => localStorage.getItem("role"),
};

