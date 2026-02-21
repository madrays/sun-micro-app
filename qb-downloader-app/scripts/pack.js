import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'packages');
const APP_ID = 'madrays-qb-downloader';

fs.mkdirSync(OUT, { recursive: true });

const appJson = {
  appJsonVersion: '1.0',
  microAppId: APP_ID,
  version: pkg.version,
  author: 'Madrays',
  entry: 'main.js',
  icon: 'logo.svg',
  components: {
    pages: { 'qb-config': { background: '#f8fafc' } },
    widgets: {
      'qb-widget': {
        configComponentName: 'qb-config',
        size: ['1x1', '1x2', '2x1', '2x2', '2x4'],
        background: '',
        isModifyBackground: true
      }
    }
  },
  permissions: ['network', 'dataNode'],
  networkDomains: ['*'],
  dataNodes: { config: { scope: 'app', isPublic: true } },
  appInfo: {
    'zh-CN': {
      appName: 'QB下载器',
      description: 'qBittorrent 下载器状态监控',
      networkDescription: '用于连接 qBittorrent WebUI'
    }
  }
};

fs.writeFileSync(path.join(DIST, 'app.json'), JSON.stringify(appJson, null, 2));

for (const f of ['logo.svg', 'logo.png']) {
  const src = path.join(PUBLIC, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, f));
}

const archiver = (await import('archiver')).default;
const zipName = `${APP_ID}-${pkg.version}.zip`;
const zipPath = path.join(OUT, zipName);
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);
archive.directory(DIST, false);
await archive.finalize();

console.log(`MicroApp ID: ${APP_ID}`);
console.log(`Created package: packages/${zipName}`);
