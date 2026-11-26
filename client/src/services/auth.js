import api, { setToken, clearToken } from "./api";

export const signup = (name, email, password) => api.post("/auth/signup", { name, email, password }).then((r) => r.data);

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  setToken(data.token);
  return data.user;
};

export const logout = () => clearToken();
export const me = () => api.get("/auth/me").then((r) => r.data);
