import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(() => ({
    server: {
        host: "localhost", // Changed from "::" to "localhost" to restrict to local only
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    build: {
        outDir: "dist/spa",
    },
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@shared": path.resolve(__dirname, "./shared"),
        },
    },
}));
