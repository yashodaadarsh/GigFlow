import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'GigFlow - The Mesh Freelancing Platform',
                short_name: 'GigFlow',
                description: 'A next-generation freelancing platform for the mesh economy.',
                theme_color: '#10b981',
                background_color: '#0A0A0B',
                display: 'standalone',
                icons: [
                    {
                        src: 'icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'mask-icon.svg',
                        sizes: '192x192 512x512',
                        type: 'image/svg+xml',
                        purpose: 'maskable'
                    }
                ]
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    define: {
        global: 'window',
    },
    server: {
        proxy: {
            '/api/auth': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
            '/api/gigs': {
                target: 'http://localhost:8082',
                changeOrigin: true,
            },
            '/api/notifications': {
                target: 'http://localhost:8083',
                changeOrigin: true,
            },
            '/api/payments': {
                target: 'http://localhost:5001',
                changeOrigin: true,
            },
            '/api/chat': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/api/video': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true,
            },
            '/ws': {
                target: 'http://localhost:8083',
                ws: true,
            }
        }
    }
})
