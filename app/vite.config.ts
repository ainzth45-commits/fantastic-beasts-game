/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages เสิร์ฟที่ /fantastic-beasts-game/ — ตั้ง base ตอน build, dev คงที่ root
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/fantastic-beasts-game/" : "/",
  test: {
    environment: "jsdom",
  },
}));
