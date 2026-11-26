import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  publicDir: here("./public"),
  envDir: here("./"),
  cacheDir: here("./node_modules/.vite"),
  build: { outDir: here("./dist"), emptyOutDir: true },
  server: { port: 5173, fs: { allow: [here("./")] }, proxy: { "/api": "http://localhost:5000" } },
});
