import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '..');

export default defineConfig({
  resolve: {
    alias: {
      '@sun-panel/micro-app': path.resolve(__dirname, 'src/micro-app-stub.js')
    }
  },
  server: {
    host: true,
    port: 5176,
    fs: {
      allow: [workspaceRoot]
    }
  }
});
