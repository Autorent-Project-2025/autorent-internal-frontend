import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const parsedPort = Number.parseInt(env.VITE_FRONTEND_PORT || "5173", 10);
  const frontendPort = Number.isFinite(parsedPort) ? parsedPort : 5173;

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: frontendPort,
    },
  };
});
