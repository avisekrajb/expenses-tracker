import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

const allowedOrigins = env.CLIENT_URL.split(",").map((s) => s.trim()).filter(Boolean);
const originAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (allowedOrigins.includes("*")) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith(".vercel.app")) return true;
    // Any localhost port during development (Vite may pick 5174+ when 5173 is busy).
    if (env.NODE_ENV !== "production" && (hostname === "localhost" || hostname === "127.0.0.1")) return true;
  } catch {
    return false;
  }
  return false;
};

app.use(cors({ origin: (origin, cb) => cb(null, originAllowed(origin)) }));
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => res.send("ok"));
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "kharcha-api", cloudinary: env.cloudinaryEnabled, time: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api", notFound);

// In production the API can also serve the built React client (single-service deploys).
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
if (env.isProd && fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use(notFound);
app.use(errorHandler);
export default app;
