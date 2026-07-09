import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    // Fabric.js is a single large chunk by design (lazy-loaded route-side).
    chunkSizeWarningLimit: 1600,
  },
});
