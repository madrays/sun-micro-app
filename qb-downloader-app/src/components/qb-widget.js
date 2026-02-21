import { html } from 'lit';
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { formatSpeed, formatBytes, formatRatio, categorizeTorrents, ICONS } from '../utils/format.js';

export class QbWidget extends SunPanelWidgetElement {
  static properties = {
    data: { type: Object },
    torrents: { type: Object },
    loading: { type: Boolean },
    error: { type: String },
    config: { type: Object }
  };

  constructor() {
    super();
    this.data = null;
    this.torrents = {};
    this.loading = true;
    this.error = '';
    this.config = {};
    this._timer = null;
    this._rid = 0;
  }

  async onInitialized() {
    this.config = this.spCtx.widgetInfo?.config || {};
    await this.fetchData();
    this.startRefresh();
  }

  onWidgetInfoChanged(newInfo) {
    const newCfg = newInfo?.config;
    if (newCfg && JSON.stringify(newCfg) !== JSON.stringify(this.config)) {
      this.config = newCfg;
      this.startRefresh();
    }
    this.requestUpdate();
  }

  startRefresh() {
    if (this._timer) clearInterval(this._timer);
    const interval = (this.config?.refreshInterval || 5) * 1000;
    this._timer = setInterval(() => this.fetchData(), interval);
  }

  onDisconnected() { if (this._timer) clearInterval(this._timer); }

  async login() {
    try {
      await this.spCtx.api.network.request({
        targetUrl: '{{host}}/api/v2/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username={{username}}&password={{password}}',
        templateReplacements: [
          { placeholder: '{{host}}', fields: ['targetUrl'], dataNode: 'config.host' },
          { placeholder: '{{username}}', fields: ['body'], dataNode: 'config.username' },
          { placeholder: '{{password}}', fields: ['body'], dataNode: 'config.password' }
        ]
      });
      return true;
    } catch { return false; }
  }

  async fetchData() {
    try {
      let res = await this.spCtx.api.network.request({
        targetUrl: `{{host}}/api/v2/sync/maindata?rid=${this._rid}`,
        method: 'GET',
        templateReplacements: [{ placeholder: '{{host}}', fields: ['targetUrl'], dataNode: 'config.host' }]
      });
      // 如果返回 Forbidden，尝试登录后重试
      if (res?.status === 403 || res?.data === 'Forbidden') {
        await this.login();
        res = await this.spCtx.api.network.request({
          targetUrl: `{{host}}/api/v2/sync/maindata?rid=${this._rid}`,
          method: 'GET',
          templateReplacements: [{ placeholder: '{{host}}', fields: ['targetUrl'], dataNode: 'config.host' }]
        });
      }
      const d = res?.data || res;
      if (d.rid) this._rid = d.rid;
      if (d.full_update || !this.data) {
        this.data = d.server_state || {};
        this.torrents = d.torrents || {};
      } else {
        if (d.server_state) Object.assign(this.data, d.server_state);
        if (d.torrents) Object.assign(this.torrents, d.torrents);
        if (d.torrents_removed) d.torrents_removed.forEach(h => delete this.torrents[h]);
      }
      this.error = '';
    } catch (e) {
      this.error = String(e?.message || '').includes('not found') ? '请先配置连接' : '连接失败';
    } finally { this.loading = false; }
  }

  get colors() {
    const light = this.config?.textMode !== 'dark';
    return {
      text: light ? '#fff' : '#1a1a2e',
      sub: light ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
      glass: light ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      dl: '#22c55e', up: '#3b82f6',
      seed: '#f59e0b', pause: '#94a3b8', total: '#a855f7',
      ratio: '#06b6d4', disk: '#ec4899'
    };
  }

  icon(name, size = 16) {
    return html`<span class="icon" style="width:${size}px;height:${size}px" .innerHTML=${ICONS[name] || ''}></span>`;
  }

  // 根据文本长度动态计算字号
  fs(text, base, min = 8) {
    const len = String(text).length;
    if (len <= 6) return base;
    if (len <= 8) return Math.max(base * 0.85, min);
    if (len <= 10) return Math.max(base * 0.7, min);
    return Math.max(base * 0.6, min);
  }

  get baseStyle() {
    const c = this.colors;
    return `:host{display:block;width:100%;height:100%;overflow:hidden}*{box-sizing:border-box;margin:0;padding:0}.w{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${c.text};display:flex;flex-direction:column;overflow:hidden;min-width:0;min-height:0}.icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}.icon svg{width:100%;height:100%}.dl{color:${c.dl}}.up{color:${c.up}}.seed{color:${c.seed}}.pause{color:${c.pause}}.total{color:${c.total}}.ratio{color:${c.ratio}}.disk{color:${c.disk}}.glass{background:${c.glass};border-radius:4px}.val,.speed-val,.speed-num,.stat-val,.item-val,.metric-val{white-space:nowrap}`;
  }

  render() {
    const c = this.colors;
    if (this.loading) return html`<style>${this.baseStyle}.w{align-items:center;justify-content:center;font-size:11px;color:${c.sub}}</style><div class="w">加载中...</div>`;
    if (this.error) return html`<style>${this.baseStyle}.w{align-items:center;justify-content:center;font-size:11px;color:#f87171}</style><div class="w">${this.error}</div>`;
    const size = this.spCtx.widgetInfo?.gridSize;
    if (size === '1x1') return this.render1x1();
    if (size === '1x2') return this.render1x2();
    if (size === '2x1') return this.render2x1();
    if (size === '2x4') return this.render2x4();
    return this.render2x2();
  }

  render1x1() {
    const d = this.data, dl = formatSpeed(d.dl_info_speed), up = formatSpeed(d.up_info_speed);
    return html`<style>${this.baseStyle}.w{align-items:center;justify-content:center;gap:8px;padding:6px}.row{display:flex;align-items:center;gap:4px}.val{font-weight:700;letter-spacing:-0.3px}</style>
      <div class="w">
        <div class="row dl">${this.icon('download',14)}<span class="val" style="font-size:${this.fs(dl,13)}px">${dl}</span></div>
        <div class="row up">${this.icon('upload',14)}<span class="val" style="font-size:${this.fs(up,13)}px">${up}</span></div>
      </div>`;
  }

  render1x2() {
    const d = this.data, c = this.colors, t = categorizeTorrents(this.torrents);
    const dl = formatSpeed(d.dl_info_speed), up = formatSpeed(d.up_info_speed);
    return html`<style>${this.baseStyle}.w{flex-direction:row;padding:8px 12px;align-items:center;justify-content:space-between}.left{display:flex;flex-direction:column;gap:6px}.row{display:flex;align-items:center;gap:4px}.val{font-weight:700}.right{display:flex;gap:12px}.stat{text-align:center}.stat-val{font-size:12px;font-weight:700;display:block}.stat-label{font-size:8px;color:${c.sub}}</style>
      <div class="w">
        <div class="left">
          <div class="row dl">${this.icon('download',12)}<span class="val" style="font-size:${this.fs(dl,14)}px">${dl}</span></div>
          <div class="row up">${this.icon('upload',12)}<span class="val" style="font-size:${this.fs(up,14)}px">${up}</span></div>
        </div>
        <div class="right">
          <div class="stat dl"><span class="stat-val">${t.downloading}</span><span class="stat-label">下载</span></div>
          <div class="stat seed"><span class="stat-val">${t.seeding}</span><span class="stat-label">做种</span></div>
          <div class="stat total"><span class="stat-val">${t.total}</span><span class="stat-label">总数</span></div>
        </div>
      </div>`;
  }

  render2x1() {
    const d = this.data, c = this.colors, t = categorizeTorrents(this.torrents);
    const dl = formatSpeed(d.dl_info_speed), up = formatSpeed(d.up_info_speed);
    return html`<style>${this.baseStyle}
      .w{padding:8px;justify-content:space-between}
      .speed-card{background:${c.glass};border-radius:8px;padding:8px 6px;text-align:center}
      .speed-icon{margin-bottom:4px;opacity:.9}
      .speed-val{font-weight:800;display:block;line-height:1.2}
      .stats{display:flex;justify-content:space-around;padding:0 4px}
      .stat{text-align:center}
      .stat-val{font-size:13px;font-weight:700;display:block}
      .stat-label{font-size:8px;color:${c.sub}}
    </style>
      <div class="w">
        <div class="speed-card dl">
          <span class="speed-icon">${this.icon('download',16)}</span>
          <span class="speed-val" style="font-size:${this.fs(dl,14)}px">${dl}</span>
        </div>
        <div class="speed-card up">
          <span class="speed-icon">${this.icon('upload',16)}</span>
          <span class="speed-val" style="font-size:${this.fs(up,14)}px">${up}</span>
        </div>
        <div class="stats">
          <div class="stat dl"><span class="stat-val">${t.downloading}</span><span class="stat-label">下载</span></div>
          <div class="stat total"><span class="stat-val">${t.total}</span><span class="stat-label">总数</span></div>
        </div>
      </div>`;
  }

  render2x2() {
    const d = this.data, c = this.colors, t = categorizeTorrents(this.torrents);
    const dl = formatSpeed(d.dl_info_speed), up = formatSpeed(d.up_info_speed);
    return html`<style>${this.baseStyle}.w{padding:10px;justify-content:space-between}.head{display:flex;justify-content:space-between;align-items:center}.title{font-size:10px;font-weight:600;opacity:.7}.speeds{display:flex;justify-content:center;gap:24px;padding:10px 0}.row{display:flex;align-items:center;gap:4px}.val{font-weight:700}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.item{text-align:center}.item-val{font-size:12px;font-weight:600;display:block}.item-label{font-size:8px;color:${c.sub}}</style>
      <div class="w">
        <div class="head"><span class="title">QB 下载器</span><span class="ratio" style="font-size:10px">${formatRatio(parseFloat(d.global_ratio))}</span></div>
        <div class="speeds">
          <div class="row dl">${this.icon('download',14)}<span class="val" style="font-size:${this.fs(dl,18)}px">${dl}</span></div>
          <div class="row up">${this.icon('upload',14)}<span class="val" style="font-size:${this.fs(up,18)}px">${up}</span></div>
        </div>
        <div class="grid">
          <div class="item dl"><span class="item-val">${t.downloading}</span><span class="item-label">下载</span></div>
          <div class="item seed"><span class="item-val">${t.seeding}</span><span class="item-label">做种</span></div>
          <div class="item pause"><span class="item-val">${t.completed}</span><span class="item-label">完成</span></div>
          <div class="item total"><span class="item-val">${t.total}</span><span class="item-label">总数</span></div>
        </div>
      </div>`;
  }

  render2x4() {
    const d = this.data, c = this.colors, t = categorizeTorrents(this.torrents);
    const dl = formatSpeed(d.dl_info_speed), up = formatSpeed(d.up_info_speed);
    const totalDl = formatBytes(d.alltime_dl), totalUp = formatBytes(d.alltime_ul);
    const ratio = formatRatio(parseFloat(d.global_ratio)), disk = formatBytes(d.free_space_on_disk);
    return html`<style>${this.baseStyle}
      .w{flex-direction:row;padding:12px;gap:12px;align-items:stretch}
      .panel{background:${c.glass};border-radius:10px;padding:10px}
      .speed-panel{display:flex;flex-direction:column;justify-content:center;gap:12px;min-width:100px}
      .speed-item{display:flex;align-items:center;gap:6px}
      .speed-num{font-weight:800;letter-spacing:-0.3px}
      .center{flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:10px}
      .row{display:flex;justify-content:space-around}
      .metric{display:flex;flex-direction:column;align-items:center;gap:3px}
      .metric-icon{opacity:.8}
      .metric-val{font-weight:700}
      .metric-label{font-size:8px;color:${c.sub}}
    </style>
      <div class="w">
        <div class="panel speed-panel">
          <div class="speed-item dl">${this.icon('download',16)}<span class="speed-num" style="font-size:${this.fs(dl,20)}px">${dl}</span></div>
          <div class="speed-item up">${this.icon('upload',16)}<span class="speed-num" style="font-size:${this.fs(up,20)}px">${up}</span></div>
        </div>
        <div class="center">
          <div class="row">
            <div class="metric dl"><span class="metric-icon">${this.icon('download',12)}</span><span class="metric-val" style="font-size:13px">${t.downloading}</span><span class="metric-label">下载中</span></div>
            <div class="metric seed"><span class="metric-icon">${this.icon('seed',12)}</span><span class="metric-val" style="font-size:13px">${t.seeding}</span><span class="metric-label">做种</span></div>
            <div class="metric pause"><span class="metric-icon">${this.icon('pause',12)}</span><span class="metric-val" style="font-size:13px">${t.paused}</span><span class="metric-label">暂停</span></div>
            <div class="metric total"><span class="metric-icon">${this.icon('total',12)}</span><span class="metric-val" style="font-size:13px">${t.total}</span><span class="metric-label">总数</span></div>
          </div>
          <div class="row">
            <div class="metric dl"><span class="metric-icon">${this.icon('totalDl',12)}</span><span class="metric-val" style="font-size:${this.fs(totalDl,13)}px">${totalDl}</span><span class="metric-label">总下载</span></div>
            <div class="metric up"><span class="metric-icon">${this.icon('totalUp',12)}</span><span class="metric-val" style="font-size:${this.fs(totalUp,13)}px">${totalUp}</span><span class="metric-label">总上传</span></div>
            <div class="metric ratio"><span class="metric-icon">${this.icon('ratio',12)}</span><span class="metric-val" style="font-size:${this.fs(ratio,13)}px">${ratio}</span><span class="metric-label">分享率</span></div>
            <div class="metric disk"><span class="metric-icon">${this.icon('disk',12)}</span><span class="metric-val" style="font-size:${this.fs(disk,13)}px">${disk}</span><span class="metric-label">剩余</span></div>
          </div>
        </div>
      </div>`;
  }

  renderItem(icon, val, label) {
    return html`<div class="item"><span class="item-icon">${this.icon(icon,12)}</span><span class="item-val">${val}</span><span class="item-label">${label}</span></div>`;
  }
}
