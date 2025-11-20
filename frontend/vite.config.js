import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    output: {
      dir: "dist",
      format: "esm",
      manualChunks: {
        // Divide dependencias grandes en chunks separados
        "react-vendor": ["react", "react-dom"],
        "pdf-viewer": [
          "@react-pdf-viewer/core",
          "@react-pdf-viewer/default-layout",
          "pdfjs-dist",
        ],
        "utility-libs": ["html2canvas", "dompurify"],
      },
    },
  },
  server: {
    port: 5000,
    open: true,
    host: '0.0.0.0',
  },
});
