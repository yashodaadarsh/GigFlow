import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
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
            }
        }
    }
})
