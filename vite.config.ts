import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const parsedPort = Number(env.VITE_DEV_PORT);
  const devPort = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 8080;

  return {
    server: {
      host: "localhost",
      port: devPort,
      strictPort: true,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
