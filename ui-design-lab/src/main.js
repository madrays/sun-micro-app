import './styles.css';
import { html, render as litRender } from 'lit';

const STATE = {
  manifest: null,
  appId: '',
  widgetId: '',
  preset: 'single',
  selectedSize: '2x2',
  unit: 76,
  gap: 22,
  previewBg: 'dark',
  widgetTheme: 'light',
  dayNight: 'auto',
  previewScale: 1,
  showGridLines: false,
  showElementOutlines: false,
  editMode: false,
  editPreviewKey: '',
  editSelectedElement: null,
  editSelectedChange: null,
  editChanges: [],
  dragSession: null,
  renderToken: 0,
  classCache: new Map(),
  lastPickedElement: null,
  toastTimer: null
};

const PRESETS = [
  { id: 'single', name: '单尺寸', getSizes: (sizes, selected) => (sizes.includes(selected) ? [selected] : [sizes[0]]) },
  { id: 'all', name: '全尺寸', getSizes: (sizes) => sizes.slice() }
];

const ZOOM_LEVELS = [1, 1.25, 1.5, 2];

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function parseSize(size) {
  const [rowsRaw, colsRaw] = size.split('x');
  const rows = Number(rowsRaw) || 1;
  const isFullWidth = String(colsRaw || '').toLowerCase() === 'full';
  const cols = isFullWidth ? 1 : (Number(colsRaw) || 1);
  return { rows, cols, isFullWidth };
}

function calcPx(size, unit, gap) {
  const { rows, cols, isFullWidth } = parseSize(size);
  return {
    width: isFullWidth ? null : (unit * cols + gap * (cols - 1)),
    height: unit * rows + gap * (rows - 1),
    cols,
    rows,
    isFullWidth
  };
}

function fallbackBaseStyle() {
  return `
    :host{display:block;width:100%;height:100%;overflow:visible}
    *{box-sizing:border-box}
    .wrap{width:100%;height:100%;display:grid;grid-template-columns:1fr 1fr;padding:4%;gap:3%;color:#fff;font-family:'Segoe UI','PingFang SC',sans-serif;overflow:visible}
    .info{display:flex;align-items:center;justify-content:flex-start;overflow:visible}
    .content{width:100%;display:flex;flex-direction:column;justify-content:center;gap:2%;overflow:visible}
    .sub{margin:0;font-size:12px;opacity:.78;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .title{margin:0;font-size:20px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .num-line{display:flex;align-items:flex-end;white-space:nowrap}
    .num{font-size:42px;font-weight:700;line-height:1}
    .unit{font-size:18px;margin-left:4px;line-height:1.2}
    .date{font-size:12px;opacity:.84;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .art-box{display:flex;align-items:center;justify-content:center;overflow:visible}
    .art{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
    .art-img{width:100%;height:100%;object-fit:contain}
    .hide-sub .sub{display:none}
    .hide-date .date{display:none}
  `;
}

function fallbackSizeStyle(size) {
  if (size === '1x1') {
    return `.wrap{grid-template-columns:1fr;padding:8%}.num{font-size:58px}.title{font-size:26px}`;
  }
  if (size === '1x2') {
    return `.wrap{grid-template-columns:30% 30% 30%;padding-left:5%;padding-right:5%}.info{grid-column:1 / 3}.art-box{grid-column:3 / 4}.title{font-size:28px}.num{font-size:56px}`;
  }
  if (size === '2x1') {
    return `.wrap{grid-template-columns:1fr;grid-template-rows:33% 33% 34%}.info{grid-row:1 / 3}.art-box{grid-row:3 / 4}.title{font-size:30px}.num{font-size:66px}`;
  }
  if (size === '2x4') {
    return `.wrap{grid-template-columns:40% 60%;padding:3%}.title{font-size:34px}.num{font-size:82px}`;
  }
  return `.wrap{grid-template-columns:50% 50%}`;
}

function sanitizeCss(css) {
  if (!css) return '';
  return css
    .replace(/\$\{[^}]+\}/g, 'initial')
    .replace(/\r/g, '');
}

function findApp() {
  return (STATE.manifest?.apps || []).find((a) => a.id === STATE.appId) || null;
}

function findWidget() {
  const app = findApp();
  if (!app) return null;
  return app.widgets.find((w) => w.id === STATE.widgetId) || null;
}

function detectWidgetCapabilities(widget) {
  const src = widget?.sourcePreview || '';
  return {
    hasTextMode: /textMode/.test(src),
    hasDarkMode: /(onDarkModeChanged|darkMode)/.test(src),
    hasDayNight: /(isDay|dayNight|sunrise|sunset|night|昼夜|白天|夜间)/i.test(src) || /weather/i.test(widget?.id || '')
  };
}

function buildDebugOverrides() {
  const isLightText = STATE.widgetTheme === 'light';
  const dayMode = STATE.dayNight;
  const textColor = isLightText ? '#ffffff' : '#0f172a';
  const subColor = isLightText ? 'rgba(255,255,255,.78)' : 'rgba(15,23,42,.70)';
  const dayBg = 'linear-gradient(145deg, rgba(59,179,255,.16), rgba(251,191,36,.18))';
  const nightBg = 'linear-gradient(145deg, rgba(67,56,202,.30), rgba(15,23,42,.35))';
  const autoBg = 'linear-gradient(145deg, rgba(59,179,255,.12), rgba(251,146,60,.13))';

  return `
    :host{display:block;width:100%;height:100%;overflow:visible !important;}
    .wrap,.info,.content,.art-box,.art,.state,.w{overflow:visible !important;}
    ${STATE.showElementOutlines ? `
    *:not(style):not(script){ outline: 1px dashed rgba(255, 255, 255, .28); outline-offset: -1px; }
    ` : ''}
    .wrap,.w,.title,.num,.unit{color:${textColor} !important;}
    .sub,.date,.h-t,.h-v,.state{color:${subColor} !important;}
    .sp-picked-copy{
      outline: 2px solid #f59e0b !important;
      outline-offset: -1px !important;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, .3) !important;
      background-clip: padding-box;
    }
    .sp-edit-selected{
      outline: 2px solid #22d3ee !important;
      outline-offset: -1px !important;
      box-shadow: 0 0 0 2px rgba(34, 211, 238, .30) !important;
    }
    .sp-edit-changed:not(.sp-edit-selected){
      outline: 1px dashed rgba(34, 211, 238, .55) !important;
      outline-offset: -1px !important;
    }
    .debug-art{
      width: 100%;
      height: 100%;
      display:flex;
      align-items:center;
      justify-content:center;
      border:1px dashed rgba(59,179,255,.38);
      border-radius:10px;
      background: ${dayMode === 'day' ? dayBg : dayMode === 'night' ? nightBg : autoBg};
    }
    .debug-art svg{width:95%;height:95%;display:block}
  `;
}

function markPickedElement(target) {
  const prev = STATE.lastPickedElement;
  if (prev && prev.isConnected && prev.classList) {
    prev.classList.remove('sp-picked-copy');
  }
  STATE.lastPickedElement = target;
  if (target && target.classList) {
    target.classList.add('sp-picked-copy');
  }
}

async function loadWidgetClass(widget) {
  if (!widget?.componentPath || !STATE.manifest?.workspaceRoot) return null;
  const cacheKey = widget.componentPath;
  if (STATE.classCache.has(cacheKey)) return STATE.classCache.get(cacheKey);

  const fsPath = `${STATE.manifest.workspaceRoot}/${widget.componentPath}`;
  const mod = await import(/* @vite-ignore */ `/@fs${fsPath}`);
  const candidates = Object.values(mod).filter((v) => typeof v === 'function');
  const WidgetClass = candidates.find((v) => /widget/i.test(v.name))
    || candidates.find((v) => typeof v?.prototype?.render === 'function')
    || null;

  STATE.classCache.set(cacheKey, WidgetClass);
  return WidgetClass;
}

function makeDemoConfig(widget) {
  const config = {
    textMode: STATE.widgetTheme
  };

  if (/weather/i.test(widget.id)) {
    return {
      apiKey: 'demo-key',
      apiHost: 'api.qweather.com',
      locationValue: '116.41,39.92',
      locationMode: 'manual',
      cityName: '北京',
      refreshInterval: 15,
      textMode: config.textMode
    };
  }

  if (/holiday/i.test(widget.id)) {
    return {
      textMode: config.textMode
    };
  }

  if (/qb/i.test(widget.id)) {
    return {
      host: 'http://localhost:8080',
      refreshInterval: 5,
      textMode: config.textMode
    };
  }

  if (/pet/i.test(widget.id)) {
    return {
      petType: 'cat',
      petName: '小橘',
      personality: 'cheerful',
      petStyle: 'cute',
      tagStyle: 0,
      textMode: config.textMode
    };
  }

  return config;
}

function applyDemoState(instance, widget, size) {
  const config = makeDemoConfig(widget);
  instance.spCtx = {
    widgetInfo: { gridSize: size, config },
    darkMode: STATE.previewBg === 'dark',
    api: {
      localCache: { app: { get: async () => null, set: async () => undefined } },
      network: { request: async () => ({}) },
      dataNode: {
        app: { getByKey: async () => null, setByKey: async () => undefined },
        user: { getByKey: async () => null, setByKey: async () => undefined }
      }
    }
  };

  instance.config = config;
  instance.loading = false;
  instance.error = '';

  if (/holiday/i.test(widget.id)) {
    instance.snapshot = {
      today: '2026-02-15',
      next: {
        name: '春节（休）',
        normalizedName: '春节',
        daysLeft: 2,
        dateObj: new Date('2026-02-17')
      }
    };
  }

  if (/weather/i.test(widget.id)) {
    instance.weather = { temp: '2', icon: '100', text: '晴' };
    instance.air = { aqi: '58', category: '良' };
    instance.hourly = [
      { fxTime: '2026-02-15T10:00+08:00', icon: '100', temp: '3' },
      { fxTime: '2026-02-15T11:00+08:00', icon: '101', temp: '4' },
      { fxTime: '2026-02-15T12:00+08:00', icon: '100', temp: '5' },
      { fxTime: '2026-02-15T13:00+08:00', icon: '104', temp: '5' },
      { fxTime: '2026-02-15T14:00+08:00', icon: '101', temp: '6' },
      { fxTime: '2026-02-15T15:00+08:00', icon: '100', temp: '6' }
    ];
    instance.daily = [
      { fxDate: '2026-02-15', iconDay: '100', tempMin: '0', tempMax: '6' },
      { fxDate: '2026-02-16', iconDay: '101', tempMin: '-1', tempMax: '5' },
      { fxDate: '2026-02-17', iconDay: '104', tempMin: '-2', tempMax: '4' },
      { fxDate: '2026-02-18', iconDay: '100', tempMin: '0', tempMax: '7' },
      { fxDate: '2026-02-19', iconDay: '101', tempMin: '1', tempMax: '8' }
    ];
  }

  if (/qb/i.test(widget.id)) {
    instance.data = {
      dl_info_speed: 15728640, up_info_speed: 5242880,
      alltime_dl: 1099511627776, alltime_ul: 549755813888,
      global_ratio: '1.85', free_space_on_disk: 214748364800
    };
    instance.torrents = {
      t1: { state: 'downloading', progress: 0.5 },
      t2: { state: 'uploading', progress: 1 },
      t3: { state: 'pausedUP', progress: 1 },
      t4: { state: 'stalledUP', progress: 1 },
      t5: { state: 'downloading', progress: 0.3 }
    };
  }

  if (/pet/i.test(widget.id)) {
    instance.state = { hunger: 80, happy: 70, love: 60, health: 90 };
    instance.action = 'idle';
    instance.frame = 0;
    instance.dialogue = '喵~';
    instance.showBubble = true;
  }
}

async function tryRenderRealWidget(shadow, widget, size, token) {
  try {
    const WidgetClass = await loadWidgetClass(widget);
    if (!WidgetClass) return false;

    if (token !== STATE.renderToken || !shadow.host?.isConnected) return false;

    const instance = new WidgetClass();
    applyDemoState(instance, widget, size);

    const template = typeof instance.render === 'function'
      ? instance.render()
      : (typeof instance.renderBySize === 'function' ? instance.renderBySize(size) : null);
    if (!template) return false;

    if (token !== STATE.renderToken || !shadow.host?.isConnected) return false;
    // 清空 fallback，避免与真实渲染叠加
    shadow.innerHTML = '';
    litRender(
      html`${template}<style>${buildDebugOverrides()}</style>`,
      shadow
    );
    return true;
  } catch {
    return false;
  }
}

function getShowFlags(widget, size) {
  const showArtSizes = widget.showArtSizes || null;
  const hideSubSizes = widget.hideSubSizes || [];
  const hideDateSizes = widget.hideDateSizes || [];

  return {
    showArt: showArtSizes ? showArtSizes.includes(size) : size !== '1x1',
    hideSub: hideSubSizes.includes(size),
    hideDate: hideDateSizes.includes(size)
  };
}

function selectorPath(node, root) {
  const parts = [];
  let cur = node;
  while (cur && cur !== root) {
    const tag = (cur.tagName || '').toLowerCase();
    const cls = cur.classList && cur.classList.length ? `.${Array.from(cur.classList).join('.')}` : '';
    parts.unshift(`${tag}${cls}`);
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}

function collectComputedStyle(style) {
  const keys = [
    'display',
    'position',
    'width',
    'height',
    'min-width',
    'min-height',
    'max-width',
    'max-height',
    'overflow',
    'overflow-x',
    'overflow-y',
    'font-size',
    'line-height',
    'font-weight',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'grid-template-columns',
    'grid-template-rows',
    'grid-column',
    'grid-row',
    'align-items',
    'justify-content'
  ];

  const out = {};
  keys.forEach((k) => {
    out[k] = style.getPropertyValue(k);
  });
  return out;
}

function showToast(message) {
  const tip = document.getElementById('copy-tip');
  tip.textContent = message;
  tip.classList.add('show');
  if (STATE.toastTimer) clearTimeout(STATE.toastTimer);
  STATE.toastTimer = setTimeout(() => tip.classList.remove('show'), 1200);
}

async function copyElementInfo(payload) {
  const text = JSON.stringify(payload, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    showToast('已复制元素信息');
  } catch {
    showToast('复制失败，请检查浏览器权限');
  }
}

function buildShadowStyle(widget, size) {
  const base = sanitizeCss(widget.baseStyle) || fallbackBaseStyle();
  const sizeCss = sanitizeCss(widget.sizeStyles?.[size]) || fallbackSizeStyle(size);
  const overrides = buildDebugOverrides();

  return `${base}\n${sizeCss}\n${overrides}`;
}

function mockSvg() {
  return `<svg viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="100%" stop-color="#22d3ee"/>
      </linearGradient>
    </defs>
    <rect x="12" y="12" width="316" height="196" rx="20" fill="url(#g)" opacity=".22"/>
    <circle cx="120" cy="110" r="34" fill="#fef08a"/>
    <rect x="156" y="88" width="72" height="50" rx="10" fill="#0f172a" opacity=".4"/>
    <path d="M70 170c30-20 54-20 84 0 30 20 54 20 84 0" stroke="#0f172a" stroke-width="6" fill="none" stroke-linecap="round" opacity=".45"/>
  </svg>`;
}

function renderPreviewHost(target, widget, size, appId, token, dims, previewKey) {
  const scale = STATE.previewScale;
  const scaledWidth = dims.isFullWidth ? null : Math.round(dims.width * scale);
  const scaledHeight = Math.round(dims.height * scale);

  const stage = el('div', 'preview-stage');
  stage.style.width = dims.isFullWidth ? '100%' : `${scaledWidth}px`;
  stage.style.height = `${scaledHeight}px`;

  const zoom = el('div', 'preview-zoom');
  zoom.style.setProperty('--preview-scale', String(scale));
  zoom.style.width = dims.isFullWidth ? '100%' : `${dims.width}px`;
  zoom.style.height = `${dims.height}px`;

  const host = el('div', 'preview-host');
  if (STATE.showGridLines) host.classList.add('show-grid');
  if (dims.isFullWidth) host.classList.add('full-width');
  host.style.width = dims.isFullWidth ? '100%' : `${dims.width}px`;
  host.style.height = `${dims.height}px`;
  host.style.setProperty('--grid-unit', `${STATE.unit}px`);
  host.style.setProperty('--grid-gap', `${STATE.gap}px`);

  const shadow = host.attachShadow({ mode: 'open' });
  const flags = getShowFlags(widget, size);
  const wrapClass = `wrap${flags.hideSub ? ' hide-sub' : ''}${flags.hideDate ? ' hide-date' : ''}`;
  const styleText = buildShadowStyle(widget, size);

  shadow.innerHTML = `
    <style>${styleText}</style>
    <div class="${wrapClass}">
      <div class="info">
        <div class="content">
          <p class="sub">距离下个节日还有</p>
          <h2 class="title">春节</h2>
          <div class="num-line"><span class="num">2</span><span class="unit">天</span></div>
          <div class="date">2026-02-17</div>
        </div>
      </div>
      ${flags.showArt ? `<div class="art-box"><div class="art"><div class="debug-art">${mockSvg()}</div></div></div>` : ''}
    </div>
  `;

  shadow.addEventListener('click', (evt) => {
    const t = evt.target;
    if (!(t instanceof Element)) return;

    const inEditMode = STATE.editMode && STATE.editPreviewKey === previewKey;
    if (inEditMode) {
      evt.preventDefault();
      evt.stopPropagation();
      selectEditableElement(t, shadow);
      showToast('已选中元素：拖动鼠标；按 +/- 缩放；Shift + +/- 调整字体');
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();
    markPickedElement(t);
    const style = getComputedStyle(t);
    const rect = t.getBoundingClientRect();

    const payload = {
      appId,
      widgetId: widget.id,
      size,
      gridStandard: {
        unit: STATE.unit,
        gap: STATE.gap,
        formula: {
          width: dims.isFullWidth ? 'full-width' : `${STATE.unit}*${dims.cols} + ${STATE.gap}*${dims.cols - 1}`,
          height: `${STATE.unit}*${dims.rows} + ${STATE.gap}*${dims.rows - 1}`
        },
        px: {
          width: dims.isFullWidth ? 'full' : dims.width,
          height: dims.height
        }
      },
      element: {
        tag: t.tagName.toLowerCase(),
        className: t.className,
        selectorPath: selectorPath(t, shadow),
        rect: {
          x: Number(rect.x.toFixed(2)),
          y: Number(rect.y.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2))
        },
        computedStyle: collectComputedStyle(style)
      },
      styleSource: {
        sizeStyle: widget.sizeStyles?.[size] || '',
        componentPath: widget.componentPath
      },
      debugView: {
        previewBg: STATE.previewBg,
        widgetTheme: STATE.widgetTheme,
        dayNight: STATE.dayNight,
        previewScale: STATE.previewScale,
        showGridLines: STATE.showGridLines,
        showElementOutlines: STATE.showElementOutlines
      }
    };

    copyElementInfo(payload);
  });

  function endDrag(evt) {
    if (!STATE.dragSession) return;
    if (evt && evt.pointerId !== undefined && STATE.dragSession.pointerId !== evt.pointerId) return;
    const selected = STATE.editSelectedElement;
    if (selected?.releasePointerCapture && STATE.dragSession.pointerId !== undefined) {
      try {
        selected.releasePointerCapture(STATE.dragSession.pointerId);
      } catch {
        // ignore
      }
    }
    if (selected) selected.style.cursor = 'grab';
    STATE.dragSession = null;
  }

  shadow.addEventListener('pointerdown', (evt) => {
    if (!(STATE.editMode && STATE.editPreviewKey === previewKey)) return;
    const t = evt.target;
    if (!(t instanceof Element)) return;
    evt.preventDefault();
    evt.stopPropagation();
    selectEditableElement(t, shadow);
    const change = STATE.editSelectedChange;
    if (!change) return;
    STATE.dragSession = {
      pointerId: evt.pointerId,
      startX: evt.clientX,
      startY: evt.clientY,
      originX: change.translateX,
      originY: change.translateY
    };
    const selected = STATE.editSelectedElement;
    if (selected?.setPointerCapture) {
      try {
        selected.setPointerCapture(evt.pointerId);
      } catch {
        // ignore
      }
    }
    if (selected) selected.style.cursor = 'grabbing';
  });

  shadow.addEventListener('pointermove', (evt) => {
    if (!(STATE.editMode && STATE.editPreviewKey === previewKey)) return;
    const drag = STATE.dragSession;
    if (!drag || drag.pointerId !== evt.pointerId) return;
    evt.preventDefault();
    const change = STATE.editSelectedChange;
    const selected = STATE.editSelectedElement;
    if (!change || !selected) return;
    const dx = evt.clientX - drag.startX;
    const dy = evt.clientY - drag.startY;
    change.translateX = drag.originX + dx;
    change.translateY = drag.originY + dy;
    applyEditChangeToElement(selected, change);
  });

  shadow.addEventListener('pointerup', endDrag);
  shadow.addEventListener('pointercancel', endDrag);

  zoom.appendChild(host);
  stage.appendChild(zoom);
  target.appendChild(stage);

  tryRenderRealWidget(shadow, widget, size, token).then((ok) => {
    if (!ok) return;
  });
}

function applyViewportTone(viewport) {
  viewport.classList.remove('tone-dark', 'tone-light', 'tone-day', 'tone-night');
  viewport.classList.add(STATE.previewBg === 'light' ? 'tone-light' : 'tone-dark');
  if (STATE.dayNight === 'day') viewport.classList.add('tone-day');
  if (STATE.dayNight === 'night') viewport.classList.add('tone-night');
}

function buildControlPanel(root) {
  const panel = el('section', 'panel');

  const title = el('h1', '', 'AI UI 协作调试台');
  const intro = el('p', '', '自动识别仓库微应用的 Widget 尺寸与样式，按 76/22 网格规则预览。点击预览元素即可复制结构与样式信息发给 AI。');

  const groupA = el('div', 'control-group');
  const appLabel = el('div', 'label', '微应用');
  const appSelect = el('select');
  appSelect.id = 'app-select';

  const widgetLabel = el('div', 'label', 'Widget');
  const widgetSelect = el('select');
  widgetSelect.id = 'widget-select';

  const refreshManifestBtn = el('button', '', '刷新最新改动');
  refreshManifestBtn.id = 'manifest-refresh-btn';
  refreshManifestBtn.style.marginTop = '8px';

  groupA.append(appLabel, appSelect, widgetLabel, widgetSelect, refreshManifestBtn);

  const groupB = el('div', 'control-group');
  groupB.appendChild(el('div', 'label', '网格标准（px）'));

  const row = el('div', 'row');
  const unitInput = el('input');
  unitInput.type = 'number';
  unitInput.min = '20';
  unitInput.max = '160';
  unitInput.value = String(STATE.unit);
  unitInput.id = 'unit-input';

  const gapInput = el('input');
  gapInput.type = 'number';
  gapInput.min = '0';
  gapInput.max = '80';
  gapInput.value = String(STATE.gap);
  gapInput.id = 'gap-input';

  row.append(unitInput, gapInput);
  groupB.append(row);

  const presetInfo = el('p', '', '默认标准：76 一格，间隔 22。示例 2x4 = 宽(76*4+22*3)，高(76*2+22*1)。');
  presetInfo.style.marginTop = '8px';
  groupB.appendChild(presetInfo);

  const groupC = el('div', 'control-group');
  groupC.appendChild(el('div', 'label', '预设布局'));

  const presetBar = el('div', 'preset-bar');
  PRESETS.forEach((p) => {
    const btn = el('button', p.id === STATE.preset ? 'active' : '', p.name);
    btn.dataset.preset = p.id;
    presetBar.appendChild(btn);
  });

  const sizeLabel = el('div', 'label', '单尺寸模式');
  sizeLabel.style.marginTop = '10px';
  const sizeSelect = el('select');
  sizeSelect.id = 'size-select';

  groupC.append(presetBar, sizeLabel, sizeSelect);

  const groupTheme = el('div', 'control-group');
  groupTheme.appendChild(el('div', 'label', '主题与文字颜色预览'));
  const themeRow = el('div', 'row');
  const bgSelect = el('select');
  bgSelect.id = 'bg-select';
  [
    ['dark', '背景: 深色'],
    ['light', '背景: 浅色']
  ].forEach(([v, t]) => bgSelect.appendChild(new Option(t, v, v === STATE.previewBg, v === STATE.previewBg)));

  const widgetThemeSelect = el('select');
  widgetThemeSelect.id = 'widget-theme-select';
  [
    ['light', '文字颜色: 浅色'],
    ['dark', '文字颜色: 深色']
  ].forEach(([v, t]) => widgetThemeSelect.appendChild(new Option(t, v, v === STATE.widgetTheme, v === STATE.widgetTheme)));
  themeRow.append(bgSelect, widgetThemeSelect);

  const dayNightSelect = el('select');
  dayNightSelect.id = 'day-night-select';
  [
    ['auto', '昼夜: 自动'],
    ['day', '昼夜: 白天'],
    ['night', '昼夜: 夜间']
  ].forEach(([v, t]) => dayNightSelect.appendChild(new Option(t, v, v === STATE.dayNight, v === STATE.dayNight)));
  dayNightSelect.style.marginTop = '8px';

  const textHint = el('p', '', '文字颜色完全手动选择，不做自动切换。缩放请在预览卡右上角点击放大镜。');
  textHint.style.marginTop = '8px';
  groupTheme.append(themeRow, dayNightSelect, textHint);

  const groupDebug = el('div', 'control-group');
  groupDebug.appendChild(el('div', 'label', '调试辅助线'));
  const toggleList = el('div', 'debug-toggle-list');
  const gridToggle = document.createElement('label');
  gridToggle.className = 'debug-toggle-item';
  gridToggle.innerHTML = `<input id="grid-lines-toggle" type="checkbox" ${STATE.showGridLines ? 'checked' : ''} /> 网格线`;
  const outlineToggle = document.createElement('label');
  outlineToggle.className = 'debug-toggle-item';
  outlineToggle.innerHTML = `<input id="element-outline-toggle" type="checkbox" ${STATE.showElementOutlines ? 'checked' : ''} /> 元素框线`;
  toggleList.append(gridToggle, outlineToggle);
  groupDebug.appendChild(toggleList);

  const groupD = el('div', 'control-group');
  groupD.appendChild(el('div', 'label', '复制说明'));
  const help = el('textarea');
  help.readOnly = true;
  help.rows = 8;
  help.value = [
    '1) 在右侧预览区域点击任意元素',
    '2) 将自动复制 JSON（元素路径、尺寸、关键样式）',
    '3) 直接粘贴给 AI，能精确沟通溢出/布局问题',
    '4) 单尺寸/放大模式下可点“编辑”，拖动元素，按 +/- 缩放',
    '5) Shift + +/- 调整选中元素字体，点“复制更改”发给 AI',
    '',
    '说明：该调试台强制 overflow: visible，超出也会显示，方便定位。'
  ].join('\n');

  groupD.appendChild(help);

  panel.append(title, intro, groupA, groupB, groupC, groupTheme, groupDebug, groupD);
  root.appendChild(panel);
}

function buildMainPanel(root) {
  const main = el('section', 'main');

  const statPanel = el('div', 'panel');
  const stat = el('div', 'stat');
  stat.id = 'stat';
  statPanel.appendChild(stat);

  const board = el('div', 'preview-board');
  const grid = el('div', 'preview-grid');
  grid.id = 'preview-grid';
  board.appendChild(grid);

  main.append(statPanel, board);
  root.appendChild(main);
}

function syncOptions() {
  const appSelect = document.getElementById('app-select');
  const widgetSelect = document.getElementById('widget-select');
  const sizeSelect = document.getElementById('size-select');

  appSelect.innerHTML = '';
  STATE.manifest.apps.forEach((app) => {
    const opt = new Option(app.id, app.id, app.id === STATE.appId, app.id === STATE.appId);
    appSelect.appendChild(opt);
  });

  const app = findApp();
  widgetSelect.innerHTML = '';
  (app?.widgets || []).forEach((w) => {
    const opt = new Option(w.id, w.id, w.id === STATE.widgetId, w.id === STATE.widgetId);
    widgetSelect.appendChild(opt);
  });

  const widget = findWidget();
  const caps = detectWidgetCapabilities(widget);
  const dayNightSelect = document.getElementById('day-night-select');
  if (dayNightSelect) dayNightSelect.disabled = !caps.hasDayNight;
  sizeSelect.innerHTML = '';
  (widget?.sizes || []).forEach((s) => {
    const opt = new Option(s, s, s === STATE.selectedSize, s === STATE.selectedSize);
    sizeSelect.appendChild(opt);
  });
}

function formatVersionTime(generatedAt) {
  const text = String(generatedAt || '').trim();
  if (!text) return '-';
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}:\d{2})/);
  if (!m) return text;
  return `${m[1]}-${Number(m[2])}-${Number(m[3])} ${m[4]}`;
}

function renderStats(widget, app) {
  const stat = document.getElementById('stat');
  stat.innerHTML = '';
  const items = [
    `应用：${app?.id || '-'}`,
    `Widget：${widget?.id || '-'}`,
    `标准：unit=${STATE.unit}px gap=${STATE.gap}px`,
    `预设：${PRESETS.find((p) => p.id === STATE.preset)?.name || '-'}`,
    `预览缩放：${Math.round(STATE.previewScale * 100)}%${STATE.previewScale > 1 ? '（单尺寸锁定）' : ''}`,
    `编辑模式：${STATE.editMode ? '开启' : '关闭'}`,
    `文字颜色：${STATE.widgetTheme === 'light' ? '浅色' : '深色'}`,
    `版本时间：${formatVersionTime(STATE.manifest.generatedAt)}`
  ];
  items.forEach((text) => {
    stat.appendChild(el('div', 'chip', text));
  });
}

function getPresetSizes(widget) {
  if (!widget) return [];
  if (STATE.previewScale > 1) {
    return widget.sizes.includes(STATE.selectedSize) ? [STATE.selectedSize] : [widget.sizes[0]];
  }
  const preset = PRESETS.find((p) => p.id === STATE.preset) || PRESETS[0];
  const sizes = preset.getSizes(widget.sizes, STATE.selectedSize);
  return sizes.filter((s) => widget.sizes.includes(s));
}

function getSizeStyleSnippet(widget, size) {
  const snippet = widget.sizeStyles?.[size];
  if (snippet) return snippet;
  const renderFn = `render${String(size || '').toLowerCase()}`;
  const src = widget.sourcePreview || '';
  if (src.includes(`${renderFn}()`)) {
    return `该组件使用 ${renderFn}() 内联 <style> 渲染，无独立 sizeStyle 配置对象。预览以真实组件渲染为准，调试底图仅在真实渲染失败时使用 fallback。`;
  }
  return '(未提取到 sizeStyle，使用调试台 fallback)';
}

function resetEditState({ keepMode = false, keepPreviewKey = false } = {}) {
  const prev = STATE.editSelectedElement;
  if (prev && prev.isConnected && prev.classList) {
    prev.classList.remove('sp-edit-selected');
  }
  STATE.editSelectedElement = null;
  STATE.editSelectedChange = null;
  STATE.dragSession = null;
  STATE.editChanges = [];
  if (!keepMode) STATE.editMode = false;
  if (!keepPreviewKey) STATE.editPreviewKey = '';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getOrCreateEditChange(element, shadowRoot) {
  const selector = selectorPath(element, shadowRoot);
  const existing = STATE.editChanges.find((c) => c.selectorPath === selector);
  if (existing) return existing;
  const computed = getComputedStyle(element);
  const baseFontPx = Number.parseFloat(computed.fontSize) || 14;
  const change = {
    selectorPath: selector,
    tag: element.tagName.toLowerCase(),
    className: element.className || '',
    translateX: 0,
    translateY: 0,
    scale: 1,
    fontScale: 1,
    baseFontPx
  };
  STATE.editChanges.push(change);
  return change;
}

function applyEditChangeToElement(element, change) {
  if (!element || !change) return;
  element.classList.add('sp-edit-changed');
  element.style.translate = `${change.translateX}px ${change.translateY}px`;
  element.style.scale = String(change.scale);
  element.style.fontSize = `${(change.baseFontPx * change.fontScale).toFixed(2)}px`;
  element.style.cursor = 'grab';
}

function selectEditableElement(element, shadowRoot) {
  if (!(element instanceof Element)) return;
  if (STATE.editSelectedElement && STATE.editSelectedElement.classList) {
    STATE.editSelectedElement.classList.remove('sp-edit-selected');
  }
  const change = getOrCreateEditChange(element, shadowRoot);
  applyEditChangeToElement(element, change);
  element.classList.add('sp-edit-selected');
  STATE.editSelectedElement = element;
  STATE.editSelectedChange = change;
}

function canUseEditMode(sizes) {
  return (sizes?.length || 0) === 1 || STATE.previewScale > 1;
}

function isMeaningfulEditChange(change) {
  if (!change) return false;
  return Math.abs(change.translateX) > 0.05
    || Math.abs(change.translateY) > 0.05
    || Math.abs(change.scale - 1) > 0.001
    || Math.abs(change.fontScale - 1) > 0.001;
}

function getEffectiveEditChanges() {
  return STATE.editChanges.filter(isMeaningfulEditChange);
}

async function copyEditChangesPayload(appId, widgetId, size) {
  const effectiveChanges = getEffectiveEditChanges();
  if (!effectiveChanges.length) {
    showToast('暂无更改可复制');
    return;
  }
  const payload = {
    appId,
    widgetId,
    size,
    mode: 'edit-assist',
    changedAt: new Date().toISOString(),
    changes: effectiveChanges.map((c) => ({
      selectorPath: c.selectorPath,
      tag: c.tag,
      className: c.className,
      before: {
        translateX: 0,
        translateY: 0,
        scale: 1,
        fontScale: 1,
        computedFontPx: Number(c.baseFontPx.toFixed(2))
      },
      after: {
        translateX: Number(c.translateX.toFixed(2)),
        translateY: Number(c.translateY.toFixed(2)),
        scale: Number(c.scale.toFixed(3)),
        fontScale: Number(c.fontScale.toFixed(3)),
        computedFontPx: Number((c.baseFontPx * c.fontScale).toFixed(2))
      }
    })),
    promptHint: '请基于 before/after 的最终差异，修改对应组件布局与字体，忽略中间编辑过程。'
  };
  try {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    showToast(`已复制更改：${effectiveChanges.length} 项`);
  } catch {
    showToast('复制更改失败，请检查浏览器权限');
  }
}

function handleEditKeyboardShortcut(evt) {
  if (!STATE.editMode) return;
  if (!STATE.editSelectedElement || !STATE.editSelectedChange) return;
  const activeTag = document.activeElement?.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

  const isPlus = evt.key === '+' || evt.key === '=' || evt.code === 'NumpadAdd';
  const isMinus = evt.key === '-' || evt.code === 'NumpadSubtract';
  if (!isPlus && !isMinus) return;
  evt.preventDefault();

  const step = isPlus ? 0.05 : -0.05;
  const change = STATE.editSelectedChange;
  if (evt.shiftKey) {
    change.fontScale = clamp(change.fontScale + step, 0.4, 4);
  } else {
    change.scale = clamp(change.scale + step, 0.2, 5);
  }
  applyEditChangeToElement(STATE.editSelectedElement, change);
}

function nextZoomLevel(current) {
  const idx = ZOOM_LEVELS.findIndex((v) => Math.abs(v - current) < 0.001);
  const nextIdx = idx === -1 ? 0 : (idx + 1) % ZOOM_LEVELS.length;
  return ZOOM_LEVELS[nextIdx];
}

function refreshPresetButtons() {
  document.querySelectorAll('.preset-bar button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.preset === STATE.preset);
  });
}

function renderPreviews() {
  const app = findApp();
  const widget = findWidget();
  if (STATE.lastPickedElement && STATE.lastPickedElement.isConnected && STATE.lastPickedElement.classList) {
    STATE.lastPickedElement.classList.remove('sp-picked-copy');
  }
  STATE.lastPickedElement = null;
  if (STATE.editSelectedElement && STATE.editSelectedElement.classList) {
    STATE.editSelectedElement.classList.remove('sp-edit-selected');
  }
  STATE.editSelectedElement = null;
  STATE.editSelectedChange = null;
  STATE.dragSession = null;
  const oldGrid = document.getElementById('preview-grid');
  const grid = el('div', 'preview-grid');
  grid.id = 'preview-grid';
  if (oldGrid) oldGrid.replaceWith(grid);
  STATE.renderToken += 1;
  const token = STATE.renderToken;

  if (!app || !widget) {
    grid.appendChild(el('div', 'chip', '未找到可预览组件'));
    return;
  }

  renderStats(widget, app);

  const sizes = getPresetSizes(widget);
  const editableMode = canUseEditMode(sizes);
  if (!editableMode && STATE.editMode) {
    resetEditState();
  }
  if (sizes.length === 1) {
    grid.classList.add('single-mode');
  }
  sizes.forEach((size) => {
    const dims = calcPx(size, STATE.unit, STATE.gap);
    const previewKey = `${app.id}::${widget.id}::${size}`;
    const scaledWidth = dims.isFullWidth ? null : Math.round(dims.width * STATE.previewScale);
    const scaledHeight = Math.round(dims.height * STATE.previewScale);

    const cell = el('div', `preview-cell${dims.isFullWidth ? ' full-span' : ''}${sizes.length === 1 ? ' single-focus' : ''}`);
    const title = el('div', 'preview-title');
    const left = document.createElement('div');
    left.innerHTML = `<strong>${size}</strong> <code>${widget.id}</code>`;
    const right = el(
      'div',
      'dim',
      dims.isFullWidth
        ? `全宽 × ${dims.height}px${STATE.previewScale > 1 ? `（放大后高 ${scaledHeight}px）` : ''}`
        : `${dims.width}px × ${dims.height}px${STATE.previewScale > 1 ? `（放大后 ${scaledWidth}px × ${scaledHeight}px）` : ''}`
    );
    title.append(left, right);

    const tools = el('div', 'preview-tools');
    if (editableMode) {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = `zoom-btn edit-btn${STATE.editMode && STATE.editPreviewKey === previewKey ? ' active' : ''}`;
      editBtn.title = '进入编辑模式';
      editBtn.textContent = STATE.editMode && STATE.editPreviewKey === previewKey ? '退出编辑' : '编辑';
      editBtn.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (STATE.editMode && STATE.editPreviewKey === previewKey) {
          resetEditState();
          showToast('已退出编辑模式');
        } else {
          resetEditState();
          STATE.editMode = true;
          STATE.editPreviewKey = previewKey;
          showToast('已进入编辑模式：拖动元素；按 +/- 缩放；Shift + +/- 调整字体');
        }
        renderPreviews();
      });
      tools.appendChild(editBtn);

      if (STATE.editMode && STATE.editPreviewKey === previewKey) {
        const copyChangeBtn = document.createElement('button');
        copyChangeBtn.type = 'button';
        copyChangeBtn.className = 'zoom-btn copy-change-btn';
        copyChangeBtn.title = '复制当前编辑更改';
        copyChangeBtn.textContent = `复制更改${getEffectiveEditChanges().length ? `(${getEffectiveEditChanges().length})` : ''}`;
        copyChangeBtn.addEventListener('click', async (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          await copyEditChangesPayload(app.id, widget.id, size);
        });
        tools.appendChild(copyChangeBtn);
      }
    }

    const zoomBtn = document.createElement('button');
    zoomBtn.type = 'button';
    zoomBtn.className = 'zoom-btn';
    zoomBtn.title = '循环缩放';
    zoomBtn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.5 15.5L21 21" />
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M10.5 7.8V13.2M7.8 10.5H13.2" />
      </svg>
      <span>${Math.round(STATE.previewScale * 100)}%</span>
    `;
    zoomBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      STATE.selectedSize = size;
      STATE.previewScale = nextZoomLevel(STATE.previewScale);
      if (STATE.previewScale > 1) {
        STATE.preset = 'single';
      }
      syncOptions();
      refreshPresetButtons();
      renderPreviews();
    });
    tools.appendChild(zoomBtn);

    const formula = el(
      'div',
      'dim',
      dims.isFullWidth
        ? `宽: 全宽（单独一行） ｜ 高: ${STATE.unit}*${dims.rows}+${STATE.gap}*${dims.rows - 1}`
        : `宽: ${STATE.unit}*${dims.cols}+${STATE.gap}*${dims.cols - 1} ｜ 高: ${STATE.unit}*${dims.rows}+${STATE.gap}*${dims.rows - 1}`
    );

    const viewport = el('div', 'preview-viewport');
    applyViewportTone(viewport);
    renderPreviewHost(viewport, widget, size, app.id, token, dims, previewKey);

    const source = document.createElement('details');
    source.className = 'source-block';
    source.innerHTML = `
      <summary>查看 ${size} 样式片段</summary>
      <div class="source-code">${getSizeStyleSnippet(widget, size)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</div>
    `;

    cell.append(title, tools, formula, viewport, source);
    grid.appendChild(cell);
  });
}

function bindEvents() {
  const appSelect = document.getElementById('app-select');
  const widgetSelect = document.getElementById('widget-select');
  const sizeSelect = document.getElementById('size-select');
  const unitInput = document.getElementById('unit-input');
  const gapInput = document.getElementById('gap-input');
  const bgSelect = document.getElementById('bg-select');
  const widgetThemeSelect = document.getElementById('widget-theme-select');
  const dayNightSelect = document.getElementById('day-night-select');
  const gridLinesToggle = document.getElementById('grid-lines-toggle');
  const elementOutlineToggle = document.getElementById('element-outline-toggle');
  const refreshManifestBtn = document.getElementById('manifest-refresh-btn');

  appSelect.addEventListener('change', () => {
    STATE.appId = appSelect.value;
    const app = findApp();
    STATE.widgetId = app?.widgets?.[0]?.id || '';
    STATE.selectedSize = app?.widgets?.[0]?.sizes?.[0] || '2x2';
    syncOptions();
    renderPreviews();
  });

  widgetSelect.addEventListener('change', () => {
    STATE.widgetId = widgetSelect.value;
    const widget = findWidget();
    STATE.selectedSize = widget?.sizes?.[0] || '2x2';
    syncOptions();
    renderPreviews();
  });

  sizeSelect.addEventListener('change', () => {
    STATE.selectedSize = sizeSelect.value;
    renderPreviews();
  });

  unitInput.addEventListener('change', () => {
    STATE.unit = Math.max(20, Number(unitInput.value) || 76);
    unitInput.value = String(STATE.unit);
    renderPreviews();
  });

  gapInput.addEventListener('change', () => {
    STATE.gap = Math.max(0, Number(gapInput.value) || 22);
    gapInput.value = String(STATE.gap);
    renderPreviews();
  });

  bgSelect.addEventListener('change', () => {
    STATE.previewBg = bgSelect.value;
    renderPreviews();
  });

  widgetThemeSelect.addEventListener('change', () => {
    STATE.widgetTheme = widgetThemeSelect.value;
    renderPreviews();
  });

  dayNightSelect.addEventListener('change', () => {
    STATE.dayNight = dayNightSelect.value;
    renderPreviews();
  });

  gridLinesToggle.addEventListener('change', () => {
    STATE.showGridLines = gridLinesToggle.checked;
    renderPreviews();
  });

  elementOutlineToggle.addEventListener('change', () => {
    STATE.showElementOutlines = elementOutlineToggle.checked;
    renderPreviews();
  });

  refreshManifestBtn.addEventListener('click', () => {
    refreshManifestFromServer();
  });

  document.querySelectorAll('.preset-bar button').forEach((btn) => {
    btn.addEventListener('click', () => {
      STATE.preset = btn.dataset.preset;
      if (STATE.preset === 'all') {
        STATE.previewScale = 1;
        resetEditState();
      }
      refreshPresetButtons();
      renderPreviews();
    });
  });

  document.addEventListener('keydown', handleEditKeyboardShortcut);
}

async function loadManifest() {
  const res = await fetch('/manifest.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`manifest 加载失败: ${res.status}`);
  return res.json();
}

async function refreshManifestFromServer() {
  const btn = document.getElementById('manifest-refresh-btn');
  const originalText = btn?.textContent || '刷新最新改动';
  if (btn) {
    btn.disabled = true;
    btn.textContent = '刷新中...';
  }

  try {
    const prev = {
      appId: STATE.appId,
      widgetId: STATE.widgetId,
      selectedSize: STATE.selectedSize
    };

    const refreshRes = await fetch('/__manifest/refresh', { method: 'POST' });
    const refreshData = await refreshRes.json().catch(() => ({}));
    if (!refreshRes.ok || refreshData?.ok === false) {
      throw new Error(refreshData?.message || `刷新失败(${refreshRes.status})`);
    }

    STATE.classCache.clear();
    STATE.manifest = await loadManifest();
    if (!Array.isArray(STATE.manifest?.apps) || STATE.manifest.apps.length === 0) {
      throw new Error('刷新后未发现可用微应用');
    }

    const appExists = STATE.manifest.apps.some((app) => app.id === prev.appId);
    if (appExists) {
      STATE.appId = prev.appId;
      const app = findApp();
      const widgetExists = app?.widgets?.some((w) => w.id === prev.widgetId);
      if (widgetExists) {
        STATE.widgetId = prev.widgetId;
        const widget = findWidget();
        STATE.selectedSize = widget?.sizes?.includes(prev.selectedSize)
          ? prev.selectedSize
          : (widget?.sizes?.[0] || '2x2');
      } else {
        STATE.widgetId = app?.widgets?.[0]?.id || '';
        STATE.selectedSize = app?.widgets?.[0]?.sizes?.[0] || '2x2';
      }
    } else {
      pickInitialState();
    }

    resetEditState();
    syncOptions();
    refreshPresetButtons();
    renderPreviews();
    showToast(`已刷新清单：${refreshData?.apps ?? STATE.manifest.apps.length} 个应用`);
  } catch (err) {
    showToast(`刷新失败：${err?.message || err}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}

function pickInitialState() {
  const firstApp = STATE.manifest.apps[0];
  STATE.appId = firstApp?.id || '';
  STATE.widgetId = firstApp?.widgets?.[0]?.id || '';
  STATE.selectedSize = firstApp?.widgets?.[0]?.sizes?.[0] || '2x2';
}

function renderAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const layout = el('div', 'layout');
  buildControlPanel(layout);
  buildMainPanel(layout);
  app.appendChild(layout);

  const tip = el('div', 'copy-tip', '已复制');
  tip.id = 'copy-tip';
  app.appendChild(tip);
}

async function bootstrap() {
  try {
    STATE.manifest = await loadManifest();
    pickInitialState();
    renderAppShell();
    syncOptions();
    bindEvents();
    renderPreviews();
  } catch (err) {
    const app = document.getElementById('app');
    app.innerHTML = `<pre style="color:#fecaca;background:#1f2937;padding:16px;border-radius:8px">${String(err?.message || err)}</pre>`;
  }
}

bootstrap();
