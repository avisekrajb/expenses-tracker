import api from "./api";

export const getBudget = (month) => api.get(`/budgets/${month}`).then((r) => r.data);
export const saveBudget = (month, body) => api.put(`/budgets/${month}`, body).then((r) => r.data);
export const deleteBudget = (month) => api.delete(`/budgets/${month}`).then((r) => r.data);
