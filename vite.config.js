//import { defineConfig } from 'vite'
//import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//export default defineConfig({
 // plugins: [react()],
//})
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "BiblioChile",
        short_name: "BiblioChile",
        description: "Literatura chilena en el transporte público de Santiago",
        theme_color: "#102a43",
        background_color: "#102a43",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
  },
});