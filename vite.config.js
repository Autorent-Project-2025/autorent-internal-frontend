import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), "");
    var apiUrl = env.VITE_API_URL || "http://localhost:5253";
    var parsedPort = Number.parseInt(env.VITE_FRONTEND_PORT || "5173", 10);
    var frontendPort = Number.isFinite(parsedPort) ? parsedPort : 5173;
    return {
        plugins: [vue()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            port: frontendPort,
            proxy: {
                "/auth": {
                    target: apiUrl,
                    changeOrigin: true,
                },
                "/tickets": {
                    target: apiUrl,
                    changeOrigin: true,
                },
            },
        },
    };
});
