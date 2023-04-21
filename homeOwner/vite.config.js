import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                // owner: resolve(__dirname, 'owner.html'),
                // visitor: resolve(__dirname, 'visitor.html'),
            },
        },
    },
    plugins: [
        VitePWA({

            // registerType: 'prompt',
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true
            },

            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'doorBell',
                short_name: 'doorBell',
                description: 'A video call app',
                theme_color: '#ffffff',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
        }),
    ],
});