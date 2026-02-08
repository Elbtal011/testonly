import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'react-dnd', 'react-dnd-html5-backend']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Handle template font paths during build
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot'],
  build: {
    // Increase chunk size warning limit to 1MB (from 500KB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Use esbuild for minification (faster and no extra dependency needed)
    minify: 'esbuild',
  },
});
