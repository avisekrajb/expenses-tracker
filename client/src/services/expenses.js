import api from "./api";

export const list = () => api.get("/expenses").then((r) => r.data);
export const create = (body) => api.post("/expenses", body).then((r) => r.data);
export const update = (id, body) => api.put(`/expenses/${id}`, body).then((r) => r.data);
// Deleting needs the account password (checked on the server).
export const remove = (id, password) => api.delete(`/expenses/${id}`, { data: { password } }).then((r) => r.data);
export const summary = (from, to) => api.get("/expenses/summary", { params: { from, to } }).then((r) => r.data);
