import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 读取配置
const appConfig = (await import('../config/app.config.js')).default;
const isDev = process.argv.includes('--dev');

// 组件配置（不能直接导入 components.config.js，因为它依赖浏览器环境）
// 需要与 config/components.config.js 保持同步
const componentsConfig = {
  pages: {
    'weather-config': {
      background: 'rgba(255, 255, 255, 0.85)',
      headerTextColor: '#1f2937'
    }
  },
  widgets: {
    'weather-widget': {
      configComponentName: 'weather-config',
      size: ['1x1', '1x2', '1xfull', '2x1', '2x2', '2x4'],
      background: 'transparent',
      isModifyBackground: true
    }
  }
};

// 生成 app.json（符合 Sun-Panel 规范）
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

// 写入 dist/app.json
const distDir = path.join(rootDir, 'dist');
fs.writeFileSync(
  path.join(distDir, 'app.json'),
  JSON.stringify(appJson, null, 2)
);

// 复制 public 目录下的文件到 dist
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    fs.copyFileSync(
      path.join(publicDir, file),
      path.join(distDir, file)
    );
  });
}

console.log('✓ Generated app.json');
console.log(`✓ MicroApp ID: ${appJson.microAppId}`);

// 创建 zip 包
const packagesDir = path.join(rootDir, 'packages');
if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir);
}

const zipName = `${appJson.microAppId}-${appJson.version}.zip`;
const zipPath = path.join(packagesDir, zipName);

// 删除旧的 zip
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// 创建 zip
execSync(`cd ${distDir} && zip -r ${zipPath} ./*`);
console.log(`✓ Created package: packages/${zipName}`);
