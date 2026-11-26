import api from "./api";

export const setup = () => api.post("/auth/2fa/setup").then((r) => r.data);
export const enable = (code) => api.post("/auth/2fa/enable", { code }).then((r) => r.data);
export const disable = (password, code) => api.post("/auth/2fa/disable", { password, code }).then((r) => r.data);
export const verify = (challengeToken, code, backup = false) =>
  api.post("/auth/2fa/verify", { challengeToken, [backup ? "backupCode" : "code"]: code }).then((r) => r.data);
