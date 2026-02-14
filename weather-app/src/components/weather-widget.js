import { html } from 'lit';
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { getWeatherIcon, getAqiColor, getAqiBgColor } from '../utils/weather-icons.js';

export class WeatherWidget extends SunPanelWidgetElement {
  static properties = {
    weather: { type: Object },
    air: { type: Object },
    hourly: { type: Array },
    daily: { type: Array },
    loading: { type: Boolean },
    error: { type: String },
    config: { type: Object }
  };

  constructor() {
    super();
    this.weather = null;
    this.air = null;
    this.hourly = [];
    this.daily = [];
    this.loading = true;
    this.error = '';
    this.config = {};
    this._refreshTimer = null;
  }

  async onInitialized() {
    await this.loadConfig();
    await this.fetchWeather();
    this.startAutoRefresh();
  }

  async onWidgetInfoChanged(newWidgetInfo, oldWidgetInfo) {
    // 无论什么变化都触发重绘（包括网格尺寸变化）
    this.requestUpdate();

    // 检查配置是否变化
    const newConfig = newWidgetInfo?.config;
    const oldConfig = oldWidgetInfo?.config;

    // 只有配置实际变化时才重新获取天气
    if (newConfig && JSON.stringify(newConfig) !== JSON.stringify(oldConfig)) {
      this.config = newConfig;
      await this.fetchWeather();
      // 刷新间隔可能变了，重新启动自动刷新
      this.startAutoRefresh();
    }
  }

  async loadConfig() {
    this.config = this.spCtx.widgetInfo?.config || {};
  }

  startAutoRefresh() {
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    const interval = (this.config?.refreshInterval || 15) * 60 * 1000;
    this._refreshTimer = setInterval(() => this.fetchWeather(), interval);
  }

  onDisconnected() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  async fetchWeather() {
    this.loading = true;
    this.error = '';

    const createRequest = (endpoint) => ({
      targetUrl: `https://{{host}}/v7/${endpoint}?location={{location}}&key={{apiKey}}`,
      method: 'GET',
      templateReplacements: [
        { placeholder: '{{apiKey}}', fields: ['targetUrl'], dataNode: 'config.apiKey' },
        { placeholder: '{{host}}', fields: ['targetUrl'], dataNode: 'config.apiHost' },
        { placeholder: '{{location}}', fields: ['targetUrl'], dataNode: 'config.locationValue' }
      ]
    });

    try {
      // 先请求主天气，避免 templateReplacements 失败时并发放大错误日志
      const nowRes = await this.spCtx.api.network.request(createRequest('weather/now'));
      const [airRes, hourlyRes, dailyRes] = await Promise.all([
        this.spCtx.api.network.request(createRequest('air/now')).catch(() => null),
        this.spCtx.api.network.request(createRequest('weather/24h')),
        this.spCtx.api.network.request(createRequest('weather/7d'))
      ]);

      const nowData = nowRes?.data || nowRes;
      const airData = airRes?.data || airRes;
      const hourlyData = hourlyRes?.data || hourlyRes;
      const dailyData = dailyRes?.data || dailyRes;

      if (nowData?.code === '200') {
        this.weather = nowData.now;
      } else {
        const errorMessages = {
          '400': '请求错误',
          '401': 'API Key 无效',
          '402': '超过访问次数限制',
          '403': '无访问权限',
          '404': '查询的数据不存在',
          '429': '请求过于频繁',
          '500': '服务器错误'
        };
        throw new Error(errorMessages[nowData?.code] || `API错误: ${nowData?.code || '未知'}`);
      }

      if (airData?.code === '200') this.air = airData.now;
      if (hourlyData?.code === '200') this.hourly = hourlyData.hourly || [];
      if (dailyData?.code === '200') this.daily = dailyData.daily || [];

    } catch (e) {
      const msg = String(e?.message || '');
      if (msg.includes('data node not found') || msg.includes('failed to get data node')) {
        this.error = '请先在配置页保存（会写入加密占位所需数据）';
      } else {
        this.error = e.message || '获取天气失败';
      }
      console.error('Weather fetch error:', e);
    } finally {
      this.loading = false;
    }
  }

  onDarkModeChanged() {
    this.requestUpdate();
  }

  get cityName() {
    return this.config?.cityName || '未知';
  }

  get colors() {
    const light = this.config?.textMode !== 'dark';
    return {
      text: light ? '#fff' : '#1a1a2e',
      textSub: light ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)',
      glass: light ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
    };
  }

  // 基础样式 - 所有尺寸统一防溢出
  get baseStyle() {
    return `
      :host { display: block; width: 100%; height: 100%; overflow: hidden; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .w {
        width: 100%; height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: ${this.colors.text};
        display: flex; flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }
    `;
  }

  render() {
    const c = this.colors;
    if (!this.config || Object.keys(this.config).length === 0) {
      return html`<style>${this.baseStyle}.w{align-items:center;justify-content:center;font-size:11px;color:${c.textSub}}</style><div class="w">请配置 API Key</div>`;
    }
    if (this.loading) {
      return html`<style>${this.baseStyle}.w{align-items:center;justify-content:center;font-size:11px;color:${c.textSub}}</style><div class="w">加载中...</div>`;
    }
    if (this.error) {
      return html`<style>${this.baseStyle}.w{align-items:center;justify-content:center;font-size:11px;color:#f87171}</style><div class="w">${this.error}</div>`;
    }

    const size = this.spCtx.widgetInfo?.gridSize;
    switch (size) {
      case '1x1': return this.render1x1();
      case '1x2': return this.render1x2();
      case '1xfull': return this.render1xfull();
      case '2x1': return this.render2x1();
      case '2x2': return this.render2x2();
      case '2x4': return this.render2x4();
      default: return this.render2x2();
    }
  }

  // 1x1: 极简紧凑
  render1x1() {
    const w = this.weather;
    return html`
      <style>
        ${this.baseStyle}
        .w { align-items: center; justify-content: center; gap: 2px; padding: 4px; }
        .icon { width: 36px; height: 36px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }
        .temp { font-size: 22px; font-weight: 700; letter-spacing: -1px; }
      </style>
      <div class="w">
        <div class="icon">${getWeatherIcon(w.icon)}</div>
        <div class="temp">${w.temp}°</div>
      </div>
    `;
  }

  // 1x2: 横向卡片（1行x2列）- 紧凑防溢出
  render1x2() {
    const w = this.weather, c = this.colors;
    const hrs = this.hourly.slice(0, 3);
    return html`
      <style>
        ${this.baseStyle}
        .w { flex-direction: row; padding: 6px 10px; align-items: center; }

        .now { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .icon { width: 26px; height: 26px; }
        .temp { font-size: 20px; font-weight: 700; letter-spacing: -1px; }

        .sep { width: 1px; height: 26px; background: ${c.glass}; margin: 0 8px; flex-shrink: 0; }

        .hrs { display: flex; flex: 1; justify-content: space-around; min-width: 0; }
        .h { display: flex; flex-direction: column; align-items: center; gap: 0; }
        .h-t { font-size: 8px; color: ${c.textSub}; }
        .h-i { width: 16px; height: 16px; }
        .h-v { font-size: 9px; font-weight: 600; }
      </style>
      <div class="w">
        <div class="now">
          <div class="icon">${getWeatherIcon(w.icon)}</div>
          <span class="temp">${w.temp}°</span>
        </div>
        <div class="sep"></div>
        <div class="hrs">
          ${hrs.map(h => html`
            <div class="h">
              <span class="h-t">${h.fxTime.slice(11,16)}</span>
              <div class="h-i">${getWeatherIcon(h.icon)}</div>
              <span class="h-v">${h.temp}°</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  // 1xfull: 横向长条 - 自适应填充 + 分割线 + 移动端适配
  render1xfull() {
    const w = this.weather, a = this.air, c = this.colors;
    // 根据容器宽度动态调整显示数量，通过 CSS 隐藏多余项
    const hrs = this.hourly.slice(0, 6);
    const days = this.daily.slice(0, 5);
    return html`
      <style>
        ${this.baseStyle}
        .w {
          flex-direction: row;
          padding: 6px 12px;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        /* 当前天气 */
        .now { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .city-pill {
          padding: 3px 8px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          white-space: nowrap;
        }
        .icon { width: 24px; height: 24px; flex-shrink: 0; }
        .temp { font-size: 20px; font-weight: 700; letter-spacing: -1px; white-space: nowrap; }
        .aqi { padding: 2px 5px; border-radius: 8px; font-size: 8px; font-weight: 600; white-space: nowrap; }

        /* 分割线 */
        .sep { width: 1px; height: 24px; background: ${c.glass}; flex-shrink: 0; }

        /* 预报区块 - 自适应填充 */
        .forecast { display: flex; flex: 1; justify-content: space-around; min-width: 0; overflow: hidden; }
        .forecast.hourly { flex: 1.2; }
        .forecast.daily { flex: 1; }
        .f-item { display: flex; flex-direction: column; align-items: center; gap: 0; min-width: 0; }
        .f-t { font-size: 8px; color: ${c.textSub}; white-space: nowrap; }
        .f-i { width: 14px; height: 14px; flex-shrink: 0; }
        .f-v { font-size: 9px; font-weight: 600; white-space: nowrap; }
        .f-v span { opacity: 0.5; }

        /* 详情 */
        .detail { font-size: 9px; color: ${c.textSub}; flex-shrink: 0; white-space: nowrap; }
        .detail b { color: ${c.text}; font-weight: 600; }

        /* 移动端适配 - 小屏幕 */
        @media (max-width: 480px) {
          .w { padding: 4px 8px; gap: 6px; }
          .city-pill { display: none; }
          .aqi { display: none; }
          .forecast.daily { display: none; }
          .sep.daily-sep { display: none; }
          .detail { display: none; }
          .sep.detail-sep { display: none; }
          .f-item:nth-child(n+5) { display: none; }
        }

        /* 中等屏幕 */
        @media (min-width: 481px) and (max-width: 680px) {
          .w { padding: 5px 10px; gap: 8px; }
          .city-pill { padding: 2px 6px; font-size: 9px; }
          .detail { display: none; }
          .sep.detail-sep { display: none; }
          .f-item:nth-child(n+5) { display: none; }
          .forecast.daily .f-item:nth-child(n+4) { display: none; }
        }

        /* 较大屏幕 */
        @media (min-width: 681px) and (max-width: 900px) {
          .f-item:nth-child(n+6) { display: none; }
          .forecast.daily .f-item:nth-child(n+5) { display: none; }
        }
      </style>
      <div class="w">
        <div class="now">
          <span class="city-pill">${this.cityName}</span>
          <div class="icon">${getWeatherIcon(w.icon)}</div>
          <span class="temp">${w.temp}°</span>
          ${a ? html`<span class="aqi" style="background:${getAqiBgColor(a.category)};color:${getAqiColor(a.category)}">${a.category}</span>` : ''}
        </div>

        <div class="sep"></div>

        <div class="forecast hourly">
          ${hrs.map(h => html`
            <div class="f-item">
              <span class="f-t">${h.fxTime.slice(11,16)}</span>
              <div class="f-i">${getWeatherIcon(h.icon)}</div>
              <span class="f-v">${h.temp}°</span>
            </div>
          `)}
        </div>

        <div class="sep daily-sep"></div>

        <div class="forecast daily">
          ${days.map((d, i) => html`
            <div class="f-item">
              <span class="f-t">${i === 0 ? '今天' : i === 1 ? '明天' : d.fxDate.slice(5)}</span>
              <div class="f-i">${getWeatherIcon(d.iconDay)}</div>
              <span class="f-v">${d.tempMax}°<span>/${d.tempMin}°</span></span>
            </div>
          `)}
        </div>

        <div class="sep detail-sep"></div>

        <span class="detail">体感<b>${w.feelsLike}°</b> 湿度<b>${w.humidity}%</b></span>
      </div>
    `;
  }

  // 2x1: 竖向卡片（2行x1列）
  render2x1() {
    const w = this.weather, c = this.colors;
    const feelsIcon = html`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`;
    const humidIcon = html`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    return html`
      <style>
        ${this.baseStyle}
        .w { padding: 8px; justify-content: center; align-items: center; gap: 3px; }
        .top { display: flex; align-items: center; gap: 6px; }
        .icon { width: 28px; height: 28px; }
        .temp { font-size: 24px; font-weight: 700; letter-spacing: -1px; }
        .desc { font-size: 12px; color: ${c.textSub}; }
        .meta { display: flex; flex-direction: column; align-items: center; gap: 1px; font-size: 11px; color: ${c.textSub}; }
        .meta-item { display: flex; align-items: center; gap: 3px; }
        .meta-item svg { opacity: 0.7; }
        .meta b { color: ${c.text}; font-weight: 600; }
      </style>
      <div class="w">
        <div class="top">
          <div class="icon">${getWeatherIcon(w.icon)}</div>
          <span class="temp">${w.temp}°</span>
        </div>
        <span class="desc">${w.text}</span>
        <div class="meta">
          <span class="meta-item">${feelsIcon}<b>${w.feelsLike}°</b></span>
          <span class="meta-item">${humidIcon}<b>${w.humidity}%</b></span>
        </div>
      </div>
    `;
  }

  // 2x2: 方形卡片 - 简洁 + 分割线
  render2x2() {
    const w = this.weather, a = this.air, c = this.colors;
    const hrs = this.hourly.slice(0, 4);
    return html`
      <style>
        ${this.baseStyle}
        .w { padding: 10px 12px; justify-content: space-between; }

        .head { display: flex; justify-content: space-between; align-items: center; }
        .city-pill {
          padding: 3px 10px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .aqi { padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }

        .main { display: flex; align-items: center; gap: 10px; }
        .icon { width: 48px; height: 48px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2)); }
        .info { flex: 1; }
        .temp { font-size: 34px; font-weight: 700; line-height: 1; letter-spacing: -2px; }
        .desc { font-size: 11px; color: ${c.textSub}; margin-top: 2px; }

        .sep { width: 100%; height: 1px; background: ${c.glass}; }

        .hrs { display: flex; justify-content: space-between; }
        .h { display: flex; flex-direction: column; align-items: center; gap: 1px; }
        .h-t { font-size: 9px; color: ${c.textSub}; }
        .h-i { width: 16px; height: 16px; }
        .h-v { font-size: 10px; font-weight: 600; }

        .meta { display: flex; justify-content: space-between; font-size: 10px; color: ${c.textSub}; }
        .meta b { color: ${c.text}; font-weight: 600; }
      </style>
      <div class="w">
        <div class="head">
          <span class="city-pill">${this.cityName}</span>
          ${a ? html`<span class="aqi" style="background:${getAqiBgColor(a.category)};color:${getAqiColor(a.category)}">${a.category} ${a.aqi}</span>` : ''}
        </div>

        <div class="main">
          <div class="icon">${getWeatherIcon(w.icon)}</div>
          <div class="info">
            <div class="temp">${w.temp}°</div>
            <div class="desc">${w.text} · 体感${w.feelsLike}°</div>
          </div>
        </div>

        <div class="sep"></div>

        <div class="hrs">
          ${hrs.map(h => html`
            <div class="h">
              <span class="h-t">${h.fxTime.slice(11,16)}</span>
              <div class="h-i">${getWeatherIcon(h.icon)}</div>
              <span class="h-v">${h.temp}°</span>
            </div>
          `)}
        </div>

        <div class="sep"></div>

        <div class="meta">
          <span>${w.windDir} <b>${w.windScale}级</b></span>
          <span>湿度 <b>${w.humidity}%</b></span>
          <span>能见度 <b>${w.vis}km</b></span>
        </div>
      </div>
    `;
  }

  // 2x4: 精致布局 - 美化胶囊城市 + 图标 + 温度
  render2x4() {
    const w = this.weather, a = this.air, c = this.colors;
    const hrs = this.hourly.slice(0, 5);
    const days = this.daily.slice(0, 3);

    return html`
      <style>
        ${this.baseStyle}
        .w {
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          height: 100%;
          min-height: 0;
        }

        /* 头部 */
        .head {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .city-pill {
          padding: 3px 8px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }
        .icon { width: 24px; height: 24px; flex-shrink: 0; }
        .temp { font-size: 20px; font-weight: 700; letter-spacing: -1px; }
        .spacer { flex: 1; }
        .aqi {
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 600;
        }

        /* 预报卡片 - 紧凑 */
        .card {
          background: ${c.glass};
          border-radius: 8px;
          padding: 4px 6px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          min-height: 0;
        }
        .item-t { font-size: 9px; color: ${c.textSub}; }
        .item-i { width: 18px; height: 18px; flex-shrink: 0; }
        .item-v { font-size: 10px; font-weight: 600; }
        .item-v span { opacity: 0.5; font-weight: 400; }
      </style>
      <div class="w">
        <div class="head">
          <span class="city-pill">${this.cityName}</span>
          <div class="icon">${getWeatherIcon(w.icon)}</div>
          <span class="temp">${w.temp}°</span>
          <div class="spacer"></div>
          ${a ? html`<span class="aqi" style="background:${getAqiBgColor(a.category)};color:${getAqiColor(a.category)}">${a.category}</span>` : ''}
        </div>
        <div class="card">
          ${hrs.map(h => html`
            <div class="item">
              <span class="item-t">${h.fxTime.slice(11,16)}</span>
              <div class="item-i">${getWeatherIcon(h.icon)}</div>
              <span class="item-v">${h.temp}°</span>
            </div>
          `)}
        </div>
        <div class="card">
          ${days.map((d, i) => html`
            <div class="item">
              <span class="item-t">${i === 0 ? '今天' : i === 1 ? '明天' : d.fxDate.slice(5)}</span>
              <div class="item-i">${getWeatherIcon(d.iconDay)}</div>
              <span class="item-v">${d.tempMax}°<span>/${d.tempMin}°</span></span>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}
