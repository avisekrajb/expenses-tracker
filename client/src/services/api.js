import axios from "axios";

const KEY = "ex_token";
export const getToken = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t) => { try { localStorage.setItem(KEY, t); } catch { /* ignore */ } };
export const clearToken = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api", timeout: 20000 });

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && getToken()) {
      clearToken();
      window.dispatchEvent(new Event("auth:logout"));
    }
    const msg = err.response?.data?.error || (err.request ? "Cannot reach the server. Check your connection." : "Something went wrong.");
    return Promise.reject(new Error(msg));
  }
);

export default api;
