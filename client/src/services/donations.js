import api from "./api";

// A payment screenshot is required. Multipart keeps image and pledge together.
export const create = (amount, method, note, screenshot) => {
  if (screenshot) {
    const fd = new FormData();
    fd.append("amount", String(amount));
    fd.append("method", method);
    fd.append("note", note || "");
    fd.append("screenshot", screenshot);
    return api.post("/donations", fd).then((r) => r.data);
  }
  return api.post("/donations", { amount, method, note }).then((r) => r.data);
};
export const mine = () => api.get("/donations/me").then((r) => r.data);
export const stats = () => api.get("/donations/stats").then((r) => r.data);
