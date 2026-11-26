import api from "./api";

export const list = (params) => api.get("/loans", { params }).then((r) => r.data);
export const summary = () => api.get("/loans/summary").then((r) => r.data);
export const create = (body) => api.post("/loans", body).then((r) => r.data);
export const update = (id, body) => api.put(`/loans/${id}`, body).then((r) => r.data);
export const settle = (id, settled = true) => api.put(`/loans/${id}/settle`, { settled }).then((r) => r.data);
export const remove = (id) => api.delete(`/loans/${id}`).then((r) => r.data);
