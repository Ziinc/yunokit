/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false,
    lib: {
      entry: "src/index.tsx",
      fileName: "index",
      name: "supacontent-lib",
    },
    rollupOptions: {
      
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
  test: {
    environment: "jsdom"
  }
});
