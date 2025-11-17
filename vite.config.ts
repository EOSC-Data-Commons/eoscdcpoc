import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(() => ({
    server: {
        host: "localhost", // Changed from "::" to "localhost" to restrict to local only
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            '/player-api': {
                target: 'https://dev3.player.eosc-data-commons.eu',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/player-api/, ''),
                secure: false,
                configure: (proxy) => {
                    proxy.on('error', (err) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req) => {
                        console.log('Sending Request to the Target:', req.method, req.url);

                        // Convert X-Authorization to standard Authorization Bearer header
                        let xAuth = proxyReq.getHeader('x-authorization');
                        if (Array.isArray(xAuth)) xAuth = xAuth[0];
                        if (xAuth && typeof xAuth === 'string') {
                            // Clean the token - remove any non-ASCII characters
                            let authVal = xAuth.trim().replace(/[^\x00-\x7F]/g, '');
                            if (!authVal.toLowerCase().startsWith('bearer ')) {
                                authVal = `Bearer ${authVal}`;
                            }
                            console.log('Setting Authorization header (length:', authVal.length, ')');
                            proxyReq.setHeader('Authorization', authVal);
                            proxyReq.removeHeader('x-authorization');
                        }
                    });
                    proxy.on('proxyRes', (proxyRes, req) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                }
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
