import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateManifestFile } from './scripts/generate-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '..');

function manifestRefreshPlugin() {
  return {
    name: 'manifest-refresh-endpoint',
    configureServer(server) {
      server.middlewares.use('/__manifest/refresh', (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, message: 'Method Not Allowed' }));
          return;
        }
        try {
          const { manifest } = generateManifestFile();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            ok: true,
            generatedAt: manifest.generatedAt,
            apps: manifest.apps.length
          }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            ok: false,
            message: error?.message || 'Refresh failed'
          }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [manifestRefreshPlugin()],
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
