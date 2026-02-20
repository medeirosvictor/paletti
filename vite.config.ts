/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['paletti.svg', 'logo-192.png', 'logo-512.png'],
            manifest: {
                name: 'Paletti — Discover Your Color Palette',
                short_name: 'Paletti',
                description:
                    'Upload a photo, detect your skin tone, and get AI-powered color recommendations for clothing and jewelry.',
                theme_color: '#1a1028',
                background_color: '#fafafa',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'logo-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'logo-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'logo-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // Don't precache face-api model files (they're large, load on demand)
                globIgnores: ['**/models/**'],
                runtimeCaching: [
                    {
                        urlPattern: /\/models\/.*/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'face-api-models',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                        },
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
    },
});
