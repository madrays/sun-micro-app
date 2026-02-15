import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const labRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(labRoot, '..');

const DEFAULT_GRID = {
  unit: 76,
  gap: 22
};

function formatShanghaiTimestamp(date = new Date()) {
  const text = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
  return `${text.replace(' ', 'T')}+08:00`;
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function sanitizeTemplateCss(cssText) {
  if (!cssText) return '';
  return cssText
    .replace(/\$\{[^}]+\}/g, (token) => {
      if (token.includes('textColor')) return '#111111';
      if (token.includes('subTextColor')) return 'rgba(17,17,17,.68)';
      return 'initial';
    })
    .replace(/\r/g, '');
}

function parseArrayLiteral(fragment) {
  if (!fragment) return [];
  const out = [];
  const re = /['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(fragment))) out.push(m[1]);
  return out;
}

function extractBracedBlock(content, openBraceIndex) {
  let depth = 0;
  let i = openBraceIndex;
  for (; i < content.length; i += 1) {
    const ch = content[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          block: content.slice(openBraceIndex + 1, i),
          endIndex: i
        };
      }
    }
  }
  return { block: '', endIndex: -1 };
}

function extractObjectAfterKeyword(content, keyword) {
  const idx = content.indexOf(keyword);
  if (idx < 0) return '';
  const braceIdx = content.indexOf('{', idx);
  if (braceIdx < 0) return '';
  return extractBracedBlock(content, braceIdx).block;
}

function extractImports(configSource, configDir) {
  const map = {};
  const namedRe = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = namedRe.exec(configSource))) {
    const vars = m[1].split(',').map((v) => v.trim()).filter(Boolean);
    const importPath = path.resolve(configDir, m[2]);
    vars.forEach((v) => {
      map[v] = importPath;
    });
  }

  const defaultRe = /import\s+([A-Za-z0-9_$]+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((m = defaultRe.exec(configSource))) {
    map[m[1]] = path.resolve(configDir, m[2]);
  }

  return map;
}

function extractWidgets(configSource, importMap) {
  const widgetsBlock = extractObjectAfterKeyword(configSource, 'widgets');
  if (!widgetsBlock) return [];

  const widgets = [];
  const keyRe = /['"]([^'"]+)['"]\s*:\s*\{/g;
  let m;
  while ((m = keyRe.exec(widgetsBlock))) {
    const widgetId = m[1];
    const braceIdx = widgetsBlock.indexOf('{', m.index);
    const { block, endIndex } = extractBracedBlock(widgetsBlock, braceIdx);
    if (!block || endIndex < 0) continue;

    const compVar = (block.match(/component\s*:\s*([A-Za-z0-9_$]+)/) || [])[1] || '';
    const sizeRaw = (block.match(/size\s*:\s*\[([^\]]*)\]/) || [])[1] || '';
    const sizes = parseArrayLiteral(sizeRaw);
    const componentPath = importMap[compVar] || '';

    widgets.push({
      widgetId,
      componentVar: compVar,
      componentPath,
      sizes
    });

    keyRe.lastIndex = endIndex + 1;
  }

  return widgets;
}

function extractTemplateLiteralFromGetter(source, getterName) {
  const getterRe = new RegExp(`get\\s+${getterName}\\s*\\(\\)\\s*\\{`, 'm');
  const gm = getterRe.exec(source);
  if (!gm) return '';

  const returnIdx = source.indexOf('return', gm.index);
  if (returnIdx < 0) return '';

  const tickStart = source.indexOf('`', returnIdx);
  if (tickStart < 0) return '';

  let i = tickStart + 1;
  while (i < source.length) {
    const ch = source[i];
    const prev = source[i - 1];
    if (ch === '`' && prev !== '\\\\') {
      return source.slice(tickStart + 1, i);
    }
    i += 1;
  }
  return '';
}

function extractSizeStyles(source) {
  const out = {};
  const styleObjectNames = ['sizeStyle', 'sizeStyles'];
  for (const name of styleObjectNames) {
    const idx = source.indexOf(`const ${name}`);
    if (idx < 0) continue;
    const braceIdx = source.indexOf('{', idx);
    if (braceIdx < 0) continue;
    const { block } = extractBracedBlock(source, braceIdx);
    const re = /['"]([^'"]+)['"]\s*:\s*`([\s\S]*?)`/g;
    let m;
    while ((m = re.exec(block))) {
      out[m[1]] = sanitizeTemplateCss(m[2]);
    }
    if (Object.keys(out).length > 0) break;
  }
  return out;
}

function extractIncludesArray(source, variableName) {
  const re = new RegExp(`${variableName}\\s*=\\s*\\[([^\\]]*)\\]\\.includes\\(size\\)`);
  const m = source.match(re);
  if (!m) return null;
  return parseArrayLiteral(m[1]);
}

function toWorkspaceRelative(absPath) {
  return path.relative(workspaceRoot, absPath).replace(/\\/g, '/');
}

function parseWidgetDesign(widget) {
  if (!widget.componentPath || !fs.existsSync(widget.componentPath)) {
    return {
      baseStyle: '',
      sizeStyles: {},
      showArtSizes: null,
      hideSubSizes: null,
      hideDateSizes: null,
      sourcePreview: ''
    };
  }

  const src = safeRead(widget.componentPath);
  return {
    baseStyle: sanitizeTemplateCss(extractTemplateLiteralFromGetter(src, 'baseStyle')),
    sizeStyles: extractSizeStyles(src),
    showArtSizes: extractIncludesArray(src, 'showArt'),
    hideSubSizes: extractIncludesArray(src, 'hideSub'),
    hideDateSizes: extractIncludesArray(src, 'hideDate'),
    sourcePreview: src.split('\n').slice(0, 180).join('\n')
  };
}

function collectApps() {
  const dirs = fs.readdirSync(workspaceRoot, { withFileTypes: true });
  const apps = [];

  for (const entry of dirs) {
    if (!entry.isDirectory()) continue;
    const appRoot = path.join(workspaceRoot, entry.name);
    const componentsConfig = path.join(appRoot, 'config', 'components.config.js');
    if (!fs.existsSync(componentsConfig)) continue;

    const source = safeRead(componentsConfig);
    if (!source) continue;

    const importMap = extractImports(source, path.dirname(componentsConfig));
    const widgets = extractWidgets(source, importMap).map((w) => {
      const design = parseWidgetDesign(w);
      return {
        id: w.widgetId,
        sizes: w.sizes,
        componentPath: w.componentPath ? toWorkspaceRelative(w.componentPath) : '',
        baseStyle: design.baseStyle,
        sizeStyles: design.sizeStyles,
        showArtSizes: design.showArtSizes,
        hideSubSizes: design.hideSubSizes,
        hideDateSizes: design.hideDateSizes,
        sourcePreview: design.sourcePreview
      };
    });

    if (!widgets.length) continue;

    apps.push({
      id: entry.name,
      path: entry.name,
      componentsConfig: toWorkspaceRelative(componentsConfig),
      widgets
    });
  }

  return apps.sort((a, b) => a.id.localeCompare(b.id));
}

export function createManifest() {
  const now = new Date();
  return {
    generatedAt: formatShanghaiTimestamp(now),
    generatedAtUtc: now.toISOString(),
    workspaceRoot,
    gridStandard: DEFAULT_GRID,
    apps: collectApps()
  };
}

export function generateManifestFile() {
  const manifest = createManifest();
  const outPath = path.join(labRoot, 'public', 'manifest.json');
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
  return { manifest, outPath };
}

function runCli() {
  const { manifest, outPath } = generateManifestFile();
  console.log(`Generated manifest: ${outPath}`);
  console.log(`Apps: ${manifest.apps.length}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli();
}
