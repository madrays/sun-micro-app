// 格式化字节
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// 格式化速度
export function formatSpeed(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec === 0) return '0 B/s';
  return formatBytes(bytesPerSec) + '/s';
}

// 格式化比率
export function formatRatio(ratio) {
  if (ratio === undefined || ratio === null || ratio < 0) return '∞';
  return ratio.toFixed(2);
}

// 种子状态分类
export function categorizeTorrents(torrents) {
  const result = {
    total: 0, downloading: 0, seeding: 0, paused: 0,
    completed: 0, error: 0, active: 0, totalSize: 0, ratioSum: 0
  };
  if (!torrents) return result;

  Object.values(torrents).forEach(t => {
    result.total++;
    result.totalSize += t.size || 0;
    result.ratioSum += t.ratio || 0;

    const s = t.state || '';
    if (s.includes('error') || s === 'missingFiles') result.error++;
    else if (s.includes('paused') || s === 'pausedDL' || s === 'pausedUP') result.paused++;
    else if (s === 'uploading' || s === 'stalledUP' || s === 'forcedUP' || s === 'queuedUP') result.seeding++;
    else if (s === 'downloading' || s === 'stalledDL' || s === 'forcedDL' || s === 'queuedDL' || s === 'metaDL') result.downloading++;

    if (t.progress >= 1) result.completed++;
    if (s === 'downloading' || s === 'uploading') result.active++;
  });

  return result;
}

// SVG 图标
export const ICONS = {
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  dlLimit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V8"/><path d="m5 15 7 7 7-7"/><line x1="4" y1="4" x2="20" y2="4"/></svg>',
  upLimit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v14"/><path d="m5 9 7-7 7 7"/><line x1="4" y1="20" x2="20" y2="20"/></svg>',
  totalDl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="m8 10 4 4 4-4"/></svg>',
  totalUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="m8 10 4-4 4 4"/></svg>',
  ratio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  disk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  size: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
  io: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  total: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  active: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  seed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z"/><circle cx="12" cy="10" r="3"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
};

// 数据字段定义
export const DATA_FIELDS = {
  dlSpeed: { label: '下载速度', icon: 'download', format: v => formatSpeed(v) },
  upSpeed: { label: '上传速度', icon: 'upload', format: v => formatSpeed(v) },
  dlLimit: { label: '下载限速', icon: 'dlLimit', format: v => v ? formatSpeed(v) : '无限制' },
  upLimit: { label: '上传限速', icon: 'upLimit', format: v => v ? formatSpeed(v) : '无限制' },
  totalDl: { label: '总下载量', icon: 'totalDl', format: v => formatBytes(v) },
  totalUp: { label: '总上传量', icon: 'totalUp', format: v => formatBytes(v) },
  globalRatio: { label: '全局分享率', icon: 'ratio', format: v => formatRatio(parseFloat(v)) },
  avgRatio: { label: '平均分享率', icon: 'ratio', format: v => formatRatio(v) },
  freeSpace: { label: '剩余空间', icon: 'disk', format: v => formatBytes(v) },
  totalSize: { label: '总大小', icon: 'size', format: v => formatBytes(v) },
  ioJobs: { label: 'I/O任务', icon: 'io', format: v => v || 0 },
  totalTorrents: { label: '总种子数', icon: 'total', format: v => v || 0 },
  downloading: { label: '活跃下载', icon: 'download', format: v => v || 0 },
  seeding: { label: '做种数量', icon: 'seed', format: v => v || 0 },
  activeSeeding: { label: '活跃种子', icon: 'fire', format: v => v || 0 },
  paused: { label: '暂停种子', icon: 'pause', format: v => v || 0 },
  completed: { label: '完成种子', icon: 'check', format: v => v || 0 },
  error: { label: '错误种子', icon: 'error', format: v => v || 0 }
};
