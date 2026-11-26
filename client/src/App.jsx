import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Expenses from "./components/Expenses";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Expenses />
      </AuthProvider>
    </ThemeProvider>
  );
}
