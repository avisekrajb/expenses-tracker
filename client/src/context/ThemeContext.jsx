import React, { createContext, useContext, useEffect, useState } from "react";
import { load, save } from "../utils/helpers";

const Ctx = createContext({ dark: false, toggle: () => {} });
export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => load("ex_theme", false));
  useEffect(() => save("ex_theme", dark), [dark]);
  return <Ctx.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>{children}</Ctx.Provider>;
}
