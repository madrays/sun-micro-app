import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const appConfig = (await import('../config/app.config.js')).default;
const isDev = process.argv.includes('--dev');

const componentsConfig = {
  pages: {
    'holiday-countdown-config': {
      background: 'rgba(255, 255, 255, 0.9)',
      headerTextColor: '#0f172a'
    }
  },
  widgets: {
    'holiday-countdown-widget': {
      configComponentName: 'holiday-countdown-config',
      size: ['1x1', '1x2', '2x1', '2x2', '2x4'],
      background: 'transparent',
      isModifyBackground: true
    }
  }
};

const appJson = {
  appJsonVersion: '1.0',
  microAppId: isDev ? `${appConfig.microAppId}-dev` : appConfig.microAppId,
  version: appConfig.version,
  author: appConfig.author,
  entry: appConfig.entry,
  icon: appConfig.icon,
  components: componentsConfig,
  permissions: appConfig.permissions || [],
  dataNodes: appConfig.dataNodes || {},
  networkDomains: appConfig.networkDomains || [],
  appInfo: appConfig.appInfo
};

const distDir = path.join(rootDir, 'dist');
fs.writeFileSync(path.join(distDir, 'app.json'), JSON.stringify(appJson, null, 2));

const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    fs.copyFileSync(path.join(publicDir, file), path.join(distDir, file));
  });
}

console.log('✓ Generated app.json');
console.log(`✓ MicroApp ID: ${appJson.microAppId}`);

const packagesDir = path.join(rootDir, 'packages');
if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir);
}

const zipName = `${appJson.microAppId}-${appJson.version}.zip`;
const zipPath = path.join(packagesDir, zipName);

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

execSync(`cd ${distDir} && zip -r ${zipPath} ./*`);
console.log(`✓ Created package: packages/${zipName}`);
