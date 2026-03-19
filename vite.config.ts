import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vike(), react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/three") || id.includes("node_modules/@react-three")) {
            return "three";
          }
        },
      },
    },
  },
});
