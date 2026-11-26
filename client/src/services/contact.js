import api from "./api";

export const details = () => api.get("/contact/details").then((r) => r.data);
export const send = (name, email, message) =>
  api.post("/contact", { name, email, message }).then((r) => r.data);
