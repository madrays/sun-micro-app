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
      name: 'WeatherApp',
      fileName: 'main',
      formats: ['es']
    },
    outDir: 'dist',
    rollupOptions: {
      // 不要将任何依赖设为外部，全部打包进去
      external: [],
      output: {
        // 确保导出默认配置对象
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
