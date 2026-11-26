import api from "./api";

export const getFeatures = () => api.get("/features/mine").then((r) => r.data);
export const requestFeature = (feature, note = "") =>
  api.post("/features/request", { feature, note }).then((r) => r.data);
export const cancelFeatureRequest = (id) =>
  api.delete(`/features/request/${id}`).then((r) => r.data);

export const admin = {
  session: () => api.get("/admin/session").then((r) => r.data),
  settings: () => api.get("/admin/settings").then((r) => r.data),
  saveSettings: (patch) => api.put("/admin/settings", patch).then((r) => r.data),
  saveLogo: (file) => {
    const fd = new FormData();
    fd.append("logo", file);
    return api.post("/admin/logo", fd).then((r) => r.data);
  },
  requests: () => api.get("/admin/requests").then((r) => r.data),
  reviewRequest: (id, status) => api.post(`/admin/requests/${id}/review`, { status }).then((r) => r.data),
  overrides: () => api.get("/admin/overrides").then((r) => r.data),
  revokeOverride: (id) => api.delete(`/admin/overrides/${id}`).then((r) => r.data),
  users: () => api.get("/admin/users").then((r) => r.data),
  donations: () => api.get("/admin/donations").then((r) => r.data),
  reviewDonation: (id, status) => api.post(`/admin/donations/${id}/review`, { status }).then((r) => r.data),
  messages: () => api.get("/admin/messages").then((r) => r.data),
  reviewMessage: (id, status) => api.post(`/admin/messages/${id}/review`, { status }).then((r) => r.data),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`).then((r) => r.data),
};
