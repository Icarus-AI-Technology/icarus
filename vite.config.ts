import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Expor variáveis de ambiente com estes prefixos ao cliente
  envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_'],
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
    // Improved code splitting for better caching and smaller chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React dependencies
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'vendor-react'
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix'
          }
          // HeroUI components
          if (id.includes('node_modules/@heroui')) {
            return 'vendor-heroui'
          }
          // Data fetching
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query'
          }
          // Charts - deixar no bundle principal para evitar problemas de inicialização
          // if (id.includes('node_modules/recharts') || 
          //     id.includes('node_modules/d3')) {
          //   return 'vendor-charts'
          // }
          // Forms
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/@hookform') || 
              id.includes('node_modules/zod')) {
            return 'vendor-forms'
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          // Motion/Animation
          if (id.includes('node_modules/motion') || 
              id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date'
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
          // Other utilities
          if (id.includes('node_modules/clsx') || 
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/class-variance-authority')) {
            return 'vendor-utils'
          }
        },
      },
    },
    // Chunk size warning limit (increased to 1000kb as per user request)
    chunkSizeWarningLimit: 1000,
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
      'lucide-react',
      'motion',
    ],
  },
}))
