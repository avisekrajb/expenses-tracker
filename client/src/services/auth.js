import api, { setToken, clearToken } from "./api";

export const signup = (name, email, password) => api.post("/auth/signup", { name, email, password }).then((r) => r.data);

const finishLogin = (response) => {
  const { data } = response;
  if (data.token) setToken(data.token);
  return data;
};

// Paste/keyboards can change the password with spaces, NBSP, zero-width
// characters, lookalike dashes or full-width letters. Try the exact value first,
// then retry with a normalised copy — never the reverse.
const trimPastedSecret = (value) => String(value ?? "")
  .normalize("NFKC")
  .replace(/[\u2010-\u2015\u2212\uFF0D]/g, "-")
  .replace(/^[\s\u00A0\uFEFF\u200B\u200C\u200D]+|[\s\u00A0\uFEFF\u200B\u200C\u200D]+$/g, "");

export const login = async (email, password) => {
  try {
    return finishLogin(await api.post("/auth/login", { email, password }));
  } catch (e) {
    const cleaned = trimPastedSecret(password);
    // The axios interceptor normalises errors to Error(message), so match on the message.
    if (!/wrong email or password/i.test(e.message) || cleaned === password) throw e;
    return finishLogin(await api.post("/auth/login", { email, password: cleaned }));
  }
};

export const verify2FA = async (challengeToken, code, backup = false) => {
  const { data } = await api.post("/auth/2fa/verify", { challengeToken, [backup ? "backupCode" : "code"]: code });
  setToken(data.token);
  return data;
};

export const logout = () => clearToken();
export const me = () => api.get("/auth/me").then((r) => r.data);
