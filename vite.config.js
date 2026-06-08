import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@viewports': path.resolve(__dirname, 'src/viewports'),
      '@widgets': path.resolve(__dirname, 'src/widgets'),
      '@algorithms': path.resolve(__dirname, 'src/algorithms'),
      '@flux': path.resolve(__dirname, 'src/flux'),
      '@connectors': path.resolve(__dirname, 'src/connectors'),
      '@design': path.resolve(__dirname, 'src/design'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
