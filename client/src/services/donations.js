import api from "./api";

export const create = (amount, method, note) =>
  api.post("/donations", { amount, method, note }).then((r) => r.data);
export const mine = () => api.get("/donations/me").then((r) => r.data);
export const stats = () => api.get("/donations/stats").then((r) => r.data);
