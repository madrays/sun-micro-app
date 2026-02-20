import { html } from 'lit';
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import {
  daysBetween,
  formatHolidayDate,
  normalizeHolidayName,
  getNextHoliday
} from '../utils/holiday-calendar.js';
import { getHolidayArtDataUri } from '../utils/holiday-art.js';

function dateKeyOf(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export class HolidayCountdownWidget extends SunPanelWidgetElement {
  static properties = {
    snapshot: { type: Object },
    loading: { type: Boolean },
    error: { type: String },
    config: { type: Object }
  };

  constructor() {
    super();
    this.snapshot = null;
    this.loading = true;
    this.error = '';
    this.config = {};
    this._timer = null;
    this._computePromise = null;
    this._lastComputeAt = 0;
  }

  async onInitialized() {
    this.loadConfig();
    await this.compute({ force: true });
    this.startTimer();
  }

  async onWidgetInfoChanged(newWidgetInfo, oldWidgetInfo) {
    this.requestUpdate();
    const newConfig = newWidgetInfo?.config || {};
    const oldConfig = oldWidgetInfo?.config || {};
    this.config = newConfig;
    if (JSON.stringify(newConfig) !== JSON.stringify(oldConfig)) {
      await this.compute({ force: true });
    }
  }

  onDisconnected() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  loadConfig() {
    this.config = this.spCtx.widgetInfo?.config || {};
  }

  startTimer() {
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this.compute({ force: true }), 60 * 60 * 1000);
  }

  async _computeCore() {
    this.loading = true;
    this.error = '';
    try {
      const now = new Date();
      const nowDateKey = dateKeyOf(now);

      // 直接本地计算下一个节日，不依赖 API
      const nextHoliday = getNextHoliday(now);
      if (!nextHoliday) {
        throw new Error('未获取到下一个节假日');
      }

      const daysLeft = daysBetween(now, nextHoliday.date);
      const next = {
        name: nextHoliday.name,
        normalizedName: nextHoliday.name,
        dateObj: nextHoliday.date,
        date: formatHolidayDate(nextHoliday.date),
        daysLeft,
        isToday: daysLeft === 0
      };

      this.snapshot = {
        today: nowDateKey,
        next
      };
    } catch (e) {
      this.error = e?.message || '节假日计算失败';
      this.snapshot = null;
    } finally {
      this.loading = false;
    }
  }

  async compute({ force = false } = {}) {
    const now = Date.now();
    if (!force && now - this._lastComputeAt < 10 * 1000) return;
    if (this._computePromise) return this._computePromise;

    this._lastComputeAt = now;
    this._computePromise = this._computeCore();
    try {
      await this._computePromise;
    } finally {
      this._computePromise = null;
    }
  }

  get nextHoliday() {
    return this.snapshot?.next || null;
  }

  get displayHolidayName() {
    const h = this.nextHoliday;
    if (!h) return '';
    return normalizeHolidayName(h.name);
  }

  get textColor() {
    return this.config?.textMode === 'dark' ? '#0f172a' : '#ffffff';
  }

  get subTextColor() {
    return this.config?.textMode === 'dark' ? 'rgba(15,23,42,.72)' : 'rgba(255,255,255,.84)';
  }

  get baseStyle() {
    return `
      :host { display:block; width:100%; height:100%; overflow:hidden; }
      * { box-sizing:border-box; }
      .wrap {
        position: relative;
        width:100%;
        height:100%;
        display:grid;
        container-type: size;
        color: ${this.textColor};
        font-family: "STKaiti", "KaiTi", "Noto Serif SC", serif;
        background: transparent;
        overflow:hidden;
        align-items: center;
        justify-items: center;
      }
      /* Default layout structure (can be overridden by specific sizes) */
      .info {
        grid-area: info;
        min-width: 0;
        max-width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .art-box {
        grid-area: art;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .content {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .sub { margin: 0 0 2%; font-size: var(--fs-sub, 3cqw); color: ${this.subTextColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
      .title { margin: 0; font-size: var(--fs-title, 6cqw); line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; text-align: center; }
      .num-line { margin: 0; white-space: nowrap; display:flex; align-items:baseline; justify-content: center; min-width:0; overflow:hidden; line-height: 1; }
      .num { font-size: var(--fs-num, 14cqw); font-weight: 700; letter-spacing: -0.02em; }
      .unit { font-size: var(--fs-unit, 4cqw); margin-left: 0.2em; }
      .date { margin-top: 2%; font-size: var(--fs-date, 3cqw); color: ${this.subTextColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
      
      .hide-sub .sub { display:none !important; }
      .hide-date .date { display:none !important; }
      
      .art { width: 100%; height: 100%; min-height: 0; opacity: 1; display:block; }
      .art-img { width:100%; height:100%; display:block; object-fit: contain; object-position: center center; }
      .state { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size: 13px; color:${this.subTextColor}; }
    `;
  }

  renderState(text) {
    return html`<style>${this.baseStyle}</style><div class="state">${text}</div>`;
  }

  renderBySize(size) {
    const h = this.nextHoliday;
    if (!h) return this.renderState('暂无节假日数据');

    const name = this.displayHolidayName;
    const showArt = ['1x2', '2x1', '2x2', '2x4'].includes(size);

    // For specific grid layouts (1x1, 1x2, 2x1), we use a flattened structure
    // where .title, .num-line, .art-box are direct children of .wrap
    // This allows them to be placed into specific grid cells defined by percentage.
    const isDirectGrid = ['1x1', '1x2', '2x1'].includes(size);

    const days = Number.isFinite(h.daysLeft) ? h.daysLeft : '--';
    const subtitle = h.isToday ? '今天就是节日' : '距离下个节日还有';
    // For standard layouts, we still need hide-sub/hide-date classes if we want to hide them easily via CSS
    const hideSub = ['1x1', '1x2', '2x1'].includes(size);
    const hideDate = ['1x1', '1x2', '2x1'].includes(size);
    const wrapClass = `wrap${hideSub ? ' hide-sub' : ''}${hideDate ? ' hide-date' : ''}`;

    const sizeStyle = {
      // 1x1: 方形小卡片 - 字大
      '1x1': `
        .wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8%;
          gap: 4%;
        }
        .title { font-size: 24cqmin; font-weight: 700; text-align: center; }
        .num-line { display: flex; align-items: baseline; justify-content: center; }
        .num { font-size: 30cqmin; font-weight: 800; }
        .unit { font-size: 20cqmin; font-weight: 600; margin-left: 0.1em; }
      `,
      // 1x2: 横向三分格 30%+30%+30%，两侧留白5%
      '1x2': `
        .wrap {
          display: grid;
          grid-template-columns: 30% 30% 30%;
          column-gap: 5%;
          padding: 0 5%;
          height: 100%;
          align-items: center;
          justify-items: center;
        }
        .title { font-size: 20cqh; font-weight: 700; text-align: center; }
        .num-line { display: flex; align-items: baseline; justify-content: center; }
        .num { font-size: 26cqh; font-weight: 800; }
        .unit { font-size: 16cqh; font-weight: 600; margin-left: 0.1em; }
        .art-box { grid-area: auto; width: 100%; height: 80%; display: flex; align-items: center; justify-content: center; }
        .art-img { width: 100%; height: 100%; object-fit: contain; }
      `,
      // 2x1: 竖向三分格
      '2x1': `
        .wrap {
          display: grid;
          grid-template-rows: 30% 30% 30%;
          row-gap: 5%;
          padding: 5% 0;
          width: 100%;
          align-items: center;
          justify-items: center;
        }
        .title { font-size: 20cqw; font-weight: 700; text-align: center; }
        .num-line { display: flex; align-items: baseline; justify-content: center; }
        .num { font-size: 26cqw; font-weight: 800; }
        .unit { font-size: 16cqw; font-weight: 600; margin-left: 0.1em; }
        .art-box { grid-area: auto; width: 80%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .art-img { width: 100%; height: 100%; object-fit: contain; }
      `,
      // 2x2: 第一行副标题，第二行左边天数+日期，右边SVG
      '2x2': `
        .wrap {
          display: grid;
          grid-template-areas:
            "sub sub"
            "info art";
          grid-template-rows: 22% 78%;
          grid-template-columns: 45% 55%;
          padding: 5%;
          gap: 2%;
        }
        .sub-row { grid-area: sub; display: flex; align-items: center; justify-content: center; font-size: 10cqw; font-weight: 700; }
        .info { grid-area: info; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6%; }
        .title { font-size: 9cqw; font-weight: 700; }
        .num-line { display: flex; align-items: baseline; justify-content: center; }
        .num { font-size: 16cqw; font-weight: 800; }
        .unit { font-size: 9cqw; font-weight: 600; margin-left: 0.05em; }
        .date { font-size: 8cqw; opacity: 0.85; }
        .art-box { grid-area: art; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .art-img { width: 100%; height: 100%; object-fit: contain; }
      `,
      // 2x4: 横向大卡片
      '2x4': `
        .wrap {
          display: grid;
          grid-template-areas: "info art";
          grid-template-columns: 35% 65%;
          padding: 4%;
          gap: 2%;
          align-items: center;
        }
        .info { display: flex; align-items: center; justify-content: center; height: 100%; }
        .content { display: flex; flex-direction: column; align-items: center; gap: 4%; text-align: center; }
        .sub { font-size: 3.5cqw; opacity: 0.85; }
        .title { font-size: 9cqw; font-weight: 700; }
        .num-line { display: flex; align-items: baseline; }
        .num { font-size: 16cqw; font-weight: 800; }
        .unit { font-size: 10cqw; font-weight: 600; margin-left: 0.05em; }
        .date { font-size: 3.5cqw; opacity: 0.8; }
        .art-box { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .art-img { width: 100%; height: 100%; object-fit: contain; }
      `
    };

    return html`
      <style>
        ${this.baseStyle}
        ${sizeStyle[size] || sizeStyle['2x2']}
      </style>
      <div class="${wrapClass}">
        ${size === '1x1'
        ? html`
              <h2 class="title">${name}</h2>
              <div class="num-line"><span class="num">${days}</span><span class="unit">天</span></div>
            `
        : size === '1x2'
        ? html`
              <h2 class="title">${name}</h2>
              <div class="num-line"><span class="num">${days}</span><span class="unit">天</span></div>
              <div class="art-box"><img class="art-img" src="${getHolidayArtDataUri(name)}" alt="${name}" /></div>
            `
        : size === '2x1'
        ? html`
              <h2 class="title">${name}</h2>
              <div class="num-line"><span class="num">${days}</span><span class="unit">天</span></div>
              <div class="art-box"><img class="art-img" src="${getHolidayArtDataUri(name)}" alt="${name}" /></div>
            `
        : size === '2x2'
        ? html`
              <div class="sub-row">${subtitle}</div>
              <div class="info">
                <h2 class="title">${name}</h2>
                <div class="num-line"><span class="num">${days}</span><span class="unit">天</span></div>
                <div class="date">${formatHolidayDate(h.dateObj)}</div>
              </div>
              <div class="art-box"><img class="art-img" src="${getHolidayArtDataUri(name)}" alt="${name}" /></div>
            `
        : html`
              <div class="info">
                <div class="content">
                  <p class="sub">${subtitle}</p>
                  <h2 class="title">${name}</h2>
                  <div class="num-line"><span class="num">${days}</span><span class="unit">天</span></div>
                  <div class="date">${formatHolidayDate(h.dateObj)}</div>
                </div>
              </div>
              <div class="art-box"><img class="art-img" src="${getHolidayArtDataUri(name)}" alt="${name}" /></div>
            `
      }
      </div>
    `;
  }

  render() {
    if (this.loading) return this.renderState('加载中...');
    if (this.error && !this.snapshot) return this.renderState(this.error);

    const size = this.spCtx.widgetInfo?.gridSize || '2x2';
    return this.renderBySize(size);
  }
}
