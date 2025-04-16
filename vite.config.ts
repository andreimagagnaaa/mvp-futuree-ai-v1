import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@hookform/resolvers',
      'yup',
      'react-hook-form',
      '@headlessui/react',
      '@heroicons/react',
      'lucide-react',
      'framer-motion',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore'
    ],
    force: true,
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
}); 