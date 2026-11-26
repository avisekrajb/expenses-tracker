import api from "./api";

export const getConfig = () => api.get("/notifications/config").then((r) => r.data);
export const subscribe = (subscription, device) =>
  api.post("/notifications/subscribe", { subscription, device }).then((r) => r.data);
export const unsubscribe = (endpoint) => api.delete("/notifications/unsubscribe", { data: { endpoint } }).then((r) => r.data);
export const list = () => api.get("/notifications/subscriptions").then((r) => r.data);
export const test = () => api.post("/notifications/test").then((r) => r.data);
export const check = () => api.post("/notifications/check").then((r) => r.data);

// VAPID keys are base64url; the Push API needs a Uint8Array.
export const urlBase64ToUint8Array = (key) => {
  const padding = "=".repeat((4 - (key.length % 4)) % 4);
  const raw = atob((key + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};
