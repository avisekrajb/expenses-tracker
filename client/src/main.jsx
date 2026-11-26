import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { registerServiceWorker } from "./utils/pwa";
import "./index.css";

registerServiceWorker();
createRoot(document.getElementById("root")).render(<App />);
