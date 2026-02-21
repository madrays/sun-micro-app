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

const APP_ID = 'madrays-pixel-pet';

fs.mkdirSync(OUT, { recursive: true });

const appJson = {
  appJsonVersion: '1.0',
  microAppId: APP_ID,
  version: pkg.version,
  author: 'Madrays',
  entry: 'main.js',
  icon: 'logo.svg',
  components: {
    pages: {
      'pixel-pet-config': { background: '#f8fafc' }
    },
    widgets: {
      'pixel-pet-widget': {
        configComponentName: 'pixel-pet-config',
        size: ['2x2', '2x4'],
        background: '',
        isModifyBackground: true
      }
    }
  },
  permissions: ['dataNode'],
  dataNodes: {
    'pet-state': { scope: 'app', isPublic: true }
  },
  appInfo: {
    'zh-CN': {
      appName: '像素宠物',
      description: '可爱的像素宠物，需要你的照顾'
    }
  }
};

fs.writeFileSync(path.join(DIST, 'app.json'), JSON.stringify(appJson, null, 2));
console.log('Generated app.json');

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
