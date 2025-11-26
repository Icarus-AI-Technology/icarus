import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Minification with Terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI components
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Charts (heavy)
          'vendor-charts': ['recharts'],
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Disable source maps in production
    sourcemap: mode !== 'production',
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zod',
    ],
  },
}))
