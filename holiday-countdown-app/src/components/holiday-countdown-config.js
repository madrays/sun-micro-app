import { html } from 'lit';
import { SunPanelPageElement } from '@sun-panel/micro-app';

export class HolidayCountdownConfig extends SunPanelPageElement {
  static properties = {
    widgetInfo: { type: Object },
    textMode: { type: String },
    saving: { type: Boolean }
  };

  constructor() {
    super();
    this.widgetInfo = {};
    this.textMode = 'light';
    this.saving = false;
  }

  async onInitialized({ widgetInfo }) {
    this.widgetInfo = widgetInfo || {};
    const config = widgetInfo?.config || {};
    this.textMode = config.textMode || 'light';
    this.requestUpdate();
  }

  async handleSaveOrCreateWidget() {
    this.saving = true;
    try {
      await this.spCtx.api.widget.save({
        ...this.widgetInfo,
        config: {
          textMode: this.textMode
        }
      });
    } finally {
      this.saving = false;
    }
  }

  getButtonTitle() {
    return this.widgetInfo?.id !== 0 ? '保存' : '创建';
  }

  render() {
    const dark = this.spCtx?.darkMode ?? false;

    const colors = {
      bg: dark ? '#1a1a1a' : '#ffffff',
      cardBg: dark ? '#242424' : '#f8f9fa',
      border: dark ? '#333' : '#e5e7eb',
      text: dark ? '#e5e5e5' : '#1f2937',
      textSecondary: dark ? '#a0a0a0' : '#6b7280',
      accent: '#3b82f6'
    };

    return html`
      <style>
        :host { display:block; height:100%; width:100%; }
        * { box-sizing:border-box; }
        .container {
          height:100%;
          padding: 20px;
          display:flex;
          flex-direction:column;
          background:${colors.bg};
          color:${colors.text};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .header { margin-bottom: 16px; }
        .title { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
        .sub { margin: 0; font-size: 13px; color: ${colors.textSecondary}; }

        .section {
          background:${colors.cardBg};
          border:1px solid ${colors.border};
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 14px;
        }

        .label { font-size: 14px; }
        .hint { font-size: 12px; color: ${colors.textSecondary}; margin-top: 2px; }

        .footer { margin-top:auto; }
        .radio-group { display:flex; gap: 10px; margin-top: 4px; }
        .radio-item {
          flex:1;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 10px 8px;
          border-radius: 8px;
          border: 1px solid ${colors.border};
          cursor: pointer;
          font-size: 13px;
          background: ${dark ? '#1a1a1a' : '#fff'};
        }
        .radio-item.active {
          border-color: ${colors.accent};
          color: ${colors.accent};
          background: ${dark ? 'rgba(59,130,246,.12)' : 'rgba(59,130,246,.08)'};
        }
        .btn {
          width:100%;
          padding: 12px;
          border: 0;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          background: ${colors.accent};
        }
        .btn:disabled { opacity: .6; }
      </style>

      <div class="container">
        <div class="header">
          <h1 class="title">节假日倒计时</h1>
          <p class="sub">仅展示下一个节日，布局会按尺寸自动优化。</p>
        </div>

        <div class="section">
          <div>
            <div class="label">文字颜色</div>
            <div class="hint">深色背景选浅色文字，浅色背景选深色文字</div>
            <div class="radio-group">
              <div class="radio-item ${this.textMode === 'light' ? 'active' : ''}" @click="${() => (this.textMode = 'light')}">浅色</div>
              <div class="radio-item ${this.textMode === 'dark' ? 'active' : ''}" @click="${() => (this.textMode = 'dark')}">深色</div>
            </div>
          </div>
          <div class="hint" style="margin-top:10px;">1x1 会自动仅显示节日名与天数；1x2、2x1 会显示节日名、天数和插画。</div>
        </div>

        <div class="footer">
          <button class="btn" ?disabled="${this.saving}" @click="${this.handleSaveOrCreateWidget}">
            ${this.saving ? '保存中...' : this.getButtonTitle()}
          </button>
        </div>
      </div>
    `;
  }
}
