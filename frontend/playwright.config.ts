import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://localhost:5173", channel: "msedge", headless: true },
  webServer: {
    command: "npm run dev -- --host localhost",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
