import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-redirects',
      closeBundle() {
        mkdirSync('dist', { recursive: true });
        writeFileSync(
          resolve('dist', '_redirects'),
          '/api/*  https://pathways-backend-3151.onrender.com/api/:splat  200!\n/*      /index.html                                             200\n'
        );
        console.log('_redirects written to dist/');
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})