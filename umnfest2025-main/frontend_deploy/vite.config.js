import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { resolve } from 'node:path';

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        tailwindcss(),
        react(),
        ViteImageOptimizer({
            png: { quality: 80 },
            jpeg: { quality: 80 },
            jpg: { quality: 80 },
            webp: { quality: 75 },
            avif: { quality: 60 },
            svg: { multipass: true },
            cache: true,
            cacheLocation: resolve(process.cwd(), 'node_modules', '.cache', 'vite-plugin-image-optimizer')
        }),
    ],
    resolve: {
        alias: {
            "@": "/resources/js",
        },
    },
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: false,
        hmr: {
            overlay: false
        }
    },
    build: {
    // Ensure previous build artifacts are removed to avoid stale, heavy assets lingering in public/build
    emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    inertia: ['@inertiajs/react']
                }
            }
        }
    }
});
