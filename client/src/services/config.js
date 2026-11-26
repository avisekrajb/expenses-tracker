import api from "./api";

let cached = null;
export const getConfig = async () => {
  if (cached) return cached;
  cached = await api.get("/config").then((r) => r.data).catch(() => ({
    app: "Kharcha", version: "2.0.0", push: { enabled: false, publicKey: "" }, donations: {},
  }));
  return cached;
};
