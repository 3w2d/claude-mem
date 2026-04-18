import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiPlugin } from './vitePlugins.js';

// When deploying to GitHub Pages at `<user>.github.io/<repo>/app/`,
// set BASE=/claude-mem/app/ before running `vite build`. Locally, leave
// BASE unset so dev + preview serve from `/`.
const base = process.env.BASE || '/';

export default defineConfig({
  base,
  plugins: [react(), apiPlugin()],
  server: { port: 5173, host: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'msal': ['@azure/msal-browser'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
