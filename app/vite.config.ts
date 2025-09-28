import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";
import compileTime from "vite-plugin-compile-time";
/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" &&
      (await import("lovable-tagger")).componentTagger(),
    compileTime(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: JSON.parse(
        fs.readFileSync(
          new URL("../shared/static/site.webmanifest", import.meta.url),
          "utf-8"
        )
      ),
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: path.resolve(__dirname, "../shared/static"),
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
}));
