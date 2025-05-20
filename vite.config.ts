import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Configuração do proxy baseada no ambiente
const getProxyConfig = () => ({
  '^/api/processAIMessage': {
    target: 'https://us-central1-teste-86bd7.cloudfunctions.net',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/processAIMessage/, '/processAIMessage'),
    secure: false,
    ws: true,
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.error('[vite] Proxy error:', err);
      });
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        proxyReq.setHeader('Origin', 'http://localhost:5174');
        proxyReq.setHeader('Access-Control-Request-Method', 'POST');
        
        console.log('[vite] Proxy request:', {
          originalPath: req.url,
          targetPath: proxyReq.path,
          method: proxyReq.method,
          headers: proxyReq.getHeaders()
        });
      });
      proxy.on('proxyRes', (proxyRes, req, _res) => {
        console.log('[vite] Proxy response:', {
          status: proxyRes.statusCode,
          headers: proxyRes.headers,
          originalPath: req.url
        });
      });
    }
  }
});

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api/chat': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/chat'),
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('[vite] Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[vite] Proxy request:', {
              originalPath: req.url,
              targetPath: proxyReq.path,
              method: proxyReq.method,
              headers: proxyReq.getHeaders()
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[vite] Proxy response:', {
              status: proxyRes.statusCode,
              headers: proxyRes.headers,
              originalPath: req.url
            });
          });
        }
      }
    },
    cors: true
  },
  preview: {
    port: 5173,
    proxy: getProxyConfig()
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
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'date-vendor': ['date-fns', 'react-day-picker'],
        },
      },
    }
  }
}); 