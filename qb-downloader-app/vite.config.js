import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: { entry: 'src/main.js', formats: ['es'], fileName: () => 'main.js' },
    outDir: 'dist',
    rollupOptions: { external: [] }
  }
});
