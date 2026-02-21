import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'PixelPetApp',
      fileName: 'main',
      formats: ['es']
    },
    rollupOptions: {
      external: [],
      output: { exports: 'named' }
    },
    minify: 'esbuild'
  }
});
