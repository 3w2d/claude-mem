import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiPlugin } from './vitePlugins.js';

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: { port: 5173, host: true },
  build: { outDir: 'dist', sourcemap: false },
});
