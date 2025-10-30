import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import reactNativeWeb from 'vite-plugin-react-native-web';

const backendUrl =
  process.env.VITE_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  'https://speakeasy-backend-823510409781.us-central1.run.app';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    reactNativeWeb(),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
  },
  define: {
    global: 'globalThis',
    __DEV__: JSON.stringify(false),
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.EXPO_PUBLIC_BACKEND_URL': JSON.stringify(backendUrl),
    'process.env.VITE_BACKEND_URL': JSON.stringify(backendUrl),
    'process.env.REACT_APP_API_URL': JSON.stringify(backendUrl),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-native-web'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
