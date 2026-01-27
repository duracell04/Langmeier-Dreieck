import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const workspaceRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@triangle/core-engine": path.resolve(workspaceRoot, "packages/core-engine/src/index.ts"),
      "@triangle/storage": path.resolve(workspaceRoot, "packages/storage/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [workspaceRoot],
    },
  },
  optimizeDeps: {
    include: ["@triangle/core-engine"],
    exclude: ["@triangle/storage"],
  },
});
