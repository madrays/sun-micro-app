import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'HolidayCountdownApp',
      fileName: 'main',
      formats: ['es']
    },
    outDir: 'dist',
    rollupOptions: {
      external: [],
      output: {
        exports: 'named'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
