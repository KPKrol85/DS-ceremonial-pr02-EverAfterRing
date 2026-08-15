import { defineConfig, devices } from "@playwright/test";

// The smoke suite runs against the production-style Vite preview, so it exercises the same
// resolved shared shell and inlined theme bootstrap that `dist/` ships. `npm run test:smoke`
// builds first, and the preview host is pinned so the server matches this base URL on every
// platform instead of depending on how `localhost` resolves.
const previewPort = 8182;
const baseURL = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL,
    // `js/theme-bootstrap.js` falls back to `prefers-color-scheme` when no theme is stored,
    // so the scheme is pinned to keep the unstored-preference case deterministic.
    colorScheme: "light"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${previewPort}`,
    url: baseURL,
    // The suite builds `dist/` immediately before running, so it must never attach to a
    // preview server that someone started from an older build.
    reuseExistingServer: false
  }
});
