import { html } from 'lit';
import { SunPanelPageElement } from '@sun-panel/micro-app';

export class WeatherConfig extends SunPanelPageElement {
  static properties = {
    widgetInfo: { type: Object },
    apiKey: { type: String },
    apiHost: { type: String },
    amapKey: { type: String },
    hasSavedApiKey: { type: Boolean },
    hasSavedApiHost: { type: Boolean },
    hasSavedAmapKey: { type: Boolean },
    showApiKey: { type: Boolean },
    showApiHost: { type: Boolean },
    showAmapKey: { type: Boolean },
    loadingApiKey: { type: Boolean },
    loadingApiHost: { type: Boolean },
    loadingAmapKey: { type: Boolean },
    locationMode: { type: String },
    location: { type: String },
    cityName: { type: String },
    longitude: { type: String },
    latitude: { type: String },
    refreshInterval: { type: Number },
    textMode: { type: String },
    saving: { type: Boolean },
    locating: { type: Boolean },
    error: { type: String },
    locationStatus: { type: String }
  };

  constructor() {
    super();
    this.widgetInfo = {};
    this.apiKey = '';
    this.apiHost = '';
    this.amapKey = '';
    this.hasSavedApiKey = false;
    this.hasSavedApiHost = false;
    this.hasSavedAmapKey = false;
    this.showApiKey = false;
    this.showApiHost = false;
    this.showAmapKey = false;
    this.loadingApiKey = false;
    this.loadingApiHost = false;
    this.loadingAmapKey = false;
    this.locationMode = 'manual';
    this.location = '101010100';
    this.cityName = '北京';
    this.longitude = '';
    this.latitude = '';
    this.refreshInterval = 15;
    this.textMode = 'light';
    this.saving = false;
    this.locating = false;
    this.error = '';
    this.locationStatus = '';
  }

  async onInitialized({ widgetInfo, customParam }) {
    this.widgetInfo = widgetInfo || {};
    const config = this.widgetInfo?.config || {};
    this.apiKey = '';
    this.apiHost = '';
    this.amapKey = '';
    this.showApiKey = false;
    this.showApiHost = false;
    this.showAmapKey = false;
    this.loadingApiKey = false;
    this.loadingApiHost = false;
    this.loadingAmapKey = false;
    this.error = '';
    this.locationStatus = '';
    // 仅从 widget 配置读取非敏感字段
    this.locationMode = config.locationMode || 'manual';
    this.location = config.location || '101010100';
    this.cityName = config.cityName || '北京';
    this.refreshInterval = config.refreshInterval || 15;
    this.textMode = config.textMode || 'light';
    this.longitude = config.longitude || '';
    this.latitude = config.latitude || '';
    this.hasSavedApiKey = Boolean(config.hasSavedApiKey ?? config.templateDataNode);
    this.hasSavedApiHost = Boolean(config.hasSavedApiHost ?? config.templateDataNode);
    this.hasSavedAmapKey = Boolean(config.hasSavedAmapKey);
    this.requestUpdate();
  }

  getMaskedPlaceholder(name, hasSaved) {
    return hasSaved ? `•••••• 已保存（点击右侧眼睛读取${name}）` : '';
  }

  getSecretStatus(hasSaved, loading) {
    if (loading) return '读取中...';
    return hasSaved ? '已保存' : '未保存';
  }

  getSecretStatusClass(hasSaved, loading) {
    if (loading) return 'status-tag loading';
    return hasSaved ? 'status-tag saved' : 'status-tag empty';
  }

  async toggleSecretVisibility(secretName) {
    const mapping = {
      apiKey: {
        show: 'showApiKey',
        loading: 'loadingApiKey',
        saved: 'hasSavedApiKey',
        value: 'apiKey',
        label: '和风 API Key'
      },
      apiHost: {
        show: 'showApiHost',
        loading: 'loadingApiHost',
        saved: 'hasSavedApiHost',
        value: 'apiHost',
        label: '和风 Host'
      },
      amapKey: {
        show: 'showAmapKey',
        loading: 'loadingAmapKey',
        saved: 'hasSavedAmapKey',
        value: 'amapKey',
        label: '高德 Key'
      }
    };

    const item = mapping[secretName];
    if (!item) return;

    if (this[item.show]) {
      this[item.show] = false;
      return;
    }

    const hasLocalValue = Boolean(this[item.value]?.trim());
    if (hasLocalValue) {
      this[item.show] = true;
      return;
    }

    this[item.loading] = true;
    this.error = '';
    try {
      const value = await this.spCtx.api.dataNode.app.getByKey('config', secretName);
      if (typeof value === 'string' && value.trim()) {
        this[item.value] = value.trim();
        this[item.saved] = true;
      } else {
        this[item.saved] = false;
      }
      this[item.show] = true;
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase();
      if (Number(e?.code) === 1202 || msg.includes('no data record found') || msg.includes('data node not found')) {
        this[item.saved] = false;
        this.error = `${item.label} 尚未保存`;
      } else {
        this.error = `读取${item.label}失败: ${e?.message || '未知错误'}`;
      }
    } finally {
      this[item.loading] = false;
    }
  }

  normalizeHost(host) {
    return host.replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
  }

  async reverseGeocodeAMap(longitude, latitude) {
    try {
      const amapKeyInput = this.amapKey.trim();
      if (amapKeyInput) {
        await this.spCtx.api.dataNode.app.setByKey('config', 'amapKey', amapKeyInput);
        this.hasSavedAmapKey = true;
      } else if (!this.hasSavedAmapKey) {
        return null;
      }

      // 敏感数据与经纬度都走 dataNode + templateReplacements
      await this.spCtx.api.dataNode.app.setByKey('config', 'geoLocation', `${longitude},${latitude}`);

      const response = await this.spCtx.api.network.request({
        targetUrl: 'https://restapi.amap.com/v3/geocode/regeo?key={{amapKey}}&location={{geoLocation}}&extensions=base',
        method: 'GET',
        templateReplacements: [
          { placeholder: '{{amapKey}}', fields: ['targetUrl'], dataNode: 'config.amapKey' },
          { placeholder: '{{geoLocation}}', fields: ['targetUrl'], dataNode: 'config.geoLocation' }
        ]
      });
      const data = response?.data || response;

      if (data.status === '1' && data.regeocode) {
        const addressComponent = data.regeocode.addressComponent;
        const province = String(addressComponent.province || '');
        const city = String(addressComponent.city || '');
        const district = String(addressComponent.district || '');

        const provinceClean = province.replace('市', '');
        const cityClean = city.replace('市', '');
        const isMunicipality = provinceClean && cityClean && provinceClean === cityClean;

        let locationName;
        if (isMunicipality) {
          locationName = provinceClean;
        } else if (cityClean) {
          locationName = cityClean;
        } else {
          locationName = provinceClean;
        }
        return locationName || null;
      }
      return null;
    } catch (e) {
      console.warn('高德逆地理编码失败:', e);
      return null;
    }
  }

  async detectLocation() {
    if (!navigator.geolocation) {
      this.error = '浏览器不支持定位功能';
      return;
    }

    this.locating = true;
    this.error = '';
    this.locationStatus = '正在获取位置...';

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      this.longitude = position.coords.longitude.toFixed(2);
      this.latitude = position.coords.latitude.toFixed(2);

      // 尝试使用高德API获取城市名（未输入但已保存时，也可直接走 dataNode）
      if (this.amapKey.trim() || this.hasSavedAmapKey) {
        this.locationStatus = '正在获取城市名称...';
        const cityName = await this.reverseGeocodeAMap(this.longitude, this.latitude);
        if (cityName) {
          this.cityName = cityName;
          this.locationStatus = `定位成功: ${cityName} (${this.longitude}, ${this.latitude})`;
        } else {
          this.locationStatus = `已获取坐标: ${this.longitude}, ${this.latitude}`;
        }
      } else {
        this.locationStatus = `已获取坐标: ${this.longitude}, ${this.latitude}（未配置高德 Key，无法自动识别城市名）`;
      }
    } catch (e) {
      const errorMsg = {
        1: '用户拒绝了定位请求',
        2: '无法获取位置信息',
        3: '定位请求超时'
      };
      this.error = errorMsg[e.code] || '定位失败';
      this.locationStatus = '';
    } finally {
      this.locating = false;
    }
  }

  getLocationValue() {
    if (this.locationMode === 'auto') {
      if (this.longitude && this.latitude) {
        return `${this.longitude},${this.latitude}`;
      }
      return '';
    }
    return this.location;
  }

  async handleSaveOrCreateWidget() {
    const apiKeyValue = this.apiKey.trim();
    const hasAvailableApiKey = Boolean(apiKeyValue || this.hasSavedApiKey);
    if (!hasAvailableApiKey) {
      this.error = '请输入和风天气 API Key';
      return;
    }

    const locationValue = this.getLocationValue();
    if (!locationValue) {
      this.error = this.locationMode === 'auto' ? '请先获取当前位置' : '请输入城市位置';
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      let hasSavedApiKey = this.hasSavedApiKey;
      let hasSavedApiHost = this.hasSavedApiHost;
      let hasSavedAmapKey = this.hasSavedAmapKey;

      const apiHostInput = this.apiHost.trim();
      const apiHostValue = this.normalizeHost(apiHostInput || 'devapi.qweather.com');
      const amapKeyValue = this.amapKey.trim();

      // 敏感数据写入 dataNode.app，不通过 widget.config 暴露。
      // 留空代表保持已保存值（不覆盖为空）。
      if (apiKeyValue) {
        await this.spCtx.api.dataNode.app.setByKey('config', 'apiKey', apiKeyValue);
        hasSavedApiKey = true;
      }

      if (apiHostInput || !hasSavedApiHost) {
        await this.spCtx.api.dataNode.app.setByKey('config', 'apiHost', apiHostValue);
        hasSavedApiHost = true;
      }

      if (amapKeyValue) {
        await this.spCtx.api.dataNode.app.setByKey('config', 'amapKey', amapKeyValue);
        hasSavedAmapKey = true;
      }

      await this.spCtx.api.dataNode.app.setByKey('config', 'locationValue', locationValue);

      // 非敏感配置
      const publicConfigData = {
        locationMode: this.locationMode,
        location: this.location.trim(),
        cityName: this.cityName.trim() || '未知',
        refreshInterval: this.refreshInterval,
        textMode: this.textMode,
        longitude: this.longitude,
        latitude: this.latitude,
        hasSavedApiKey,
        hasSavedApiHost,
        hasSavedAmapKey,
        templateDataNode: 'config.apiKey'
      };

      // dataNode 里保留完整配置（包含经纬度）
      await this.spCtx.api.dataNode.app.setByKey('config', 'settings', publicConfigData);

      this.hasSavedApiKey = hasSavedApiKey;
      this.hasSavedApiHost = hasSavedApiHost;
      this.hasSavedAmapKey = hasSavedAmapKey;

      // 保存 widget 配置（仅非敏感字段）
      await this.spCtx.api.widget.save({
        ...this.widgetInfo,
        config: publicConfigData
      });
    } catch (e) {
      this.error = '保存失败: ' + (e?.message || '未知错误');
    } finally {
      this.saving = false;
    }
  }

  getButtonTitle() {
    return this.widgetInfo?.id !== 0 ? '保存' : '创建';
  }

  get iconKey() {
    return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`;
  }

  get iconLocation() {
    return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }

  get iconClock() {
    return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
  }

  get iconTarget() {
    return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;
  }

  get iconMap() {
    return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`;
  }

  get iconEye() {
    return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }

  get iconEyeOff() {
    return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.85 21.85 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }

  render() {
    const dark = this.spCtx?.darkMode ?? false;

    const colors = {
      bg: dark ? '#1a1a1a' : '#ffffff',
      cardBg: dark ? '#242424' : '#f8f9fa',
      border: dark ? '#333' : '#e5e7eb',
      text: dark ? '#e5e5e5' : '#1f2937',
      textSecondary: dark ? '#a0a0a0' : '#6b7280',
      accent: '#3b82f6',
      inputBg: dark ? '#1a1a1a' : '#ffffff',
      error: '#ef4444',
      success: '#22c55e'
    };

    return html`
      <style>
        :host { display: block; height: 100%; width: 100%; }
        * { box-sizing: border-box; }
        .config-container {
          height: 100%; width: 100%; padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: ${colors.text};
          display: flex; flex-direction: column;
          background: ${colors.bg};
        }
        .config-header { margin-bottom: 20px; }
        .config-title { font-size: 18px; font-weight: 600; margin: 0 0 4px; color: ${colors.text}; }
        .config-subtitle { font-size: 13px; color: ${colors.textSecondary}; margin: 0; }
        .config-content { flex: 1; overflow-y: auto; }
        .config-section {
          background: ${colors.cardBg};
          border: 1px solid ${colors.border};
          border-radius: 8px; padding: 16px; margin-bottom: 16px;
        }
        .section-header {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px; color: ${colors.textSecondary};
        }
        .section-title { font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-row { margin-bottom: 16px; }
        .form-row:last-child { margin-bottom: 0; }
        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }
        .form-label { display: block; font-size: 13px; font-weight: 500; color: ${colors.text}; margin-bottom: 6px; }
        .label-row .form-label { margin-bottom: 0; }
        .form-input {
          width: 100%; padding: 10px 12px; font-size: 14px;
          border: 1px solid ${colors.border}; border-radius: 6px;
          background: ${colors.inputBg}; color: ${colors.text};
          transition: border-color 0.2s;
        }
        .form-input:focus { outline: none; border-color: ${colors.accent}; }
        .form-input::placeholder { color: ${colors.textSecondary}; }
        .input-wrap {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 42px;
          gap: 8px;
          align-items: center;
        }
        .btn-eye {
          height: 40px;
          border: 1px solid ${colors.border};
          background: ${colors.inputBg};
          color: ${colors.textSecondary};
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-eye:hover:not(:disabled) {
          color: ${colors.accent};
          border-color: ${colors.accent};
        }
        .btn-eye:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .status-tag {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid transparent;
          line-height: 1.5;
        }
        .status-tag.saved {
          color: ${dark ? '#86efac' : '#166534'};
          border-color: ${dark ? 'rgba(34,197,94,.35)' : '#86efac'};
          background: ${dark ? 'rgba(34,197,94,.12)' : '#f0fdf4'};
        }
        .status-tag.empty {
          color: ${colors.textSecondary};
          border-color: ${colors.border};
          background: ${dark ? 'rgba(255,255,255,.04)' : '#f9fafb'};
        }
        .status-tag.loading {
          color: ${dark ? '#93c5fd' : '#1d4ed8'};
          border-color: ${dark ? 'rgba(59,130,246,.4)' : '#bfdbfe'};
          background: ${dark ? 'rgba(59,130,246,.12)' : '#eff6ff'};
        }
        .form-hint { font-size: 12px; color: ${colors.textSecondary}; margin-top: 4px; }
        .form-hint a { color: ${colors.accent}; text-decoration: none; }
        .info-box {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 12px; margin-bottom: 16px; font-size: 12px;
          color: ${dark ? '#93c5fd' : '#1e3a8a'};
          background: ${dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.06)'};
          border: 1px solid ${dark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.28)'};
          border-radius: 6px; line-height: 1.5;
        }
        .info-box svg { flex-shrink: 0; margin-top: 2px; }
        .info-box code {
          padding: 1px 4px; font-size: 11px;
          background: ${dark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'};
          border-radius: 3px; font-family: monospace;
        }
        .radio-group { display: flex; gap: 12px; }
        .radio-item {
          flex: 1; display: flex; align-items: center; gap: 8px;
          padding: 10px 12px; border: 1px solid ${colors.border};
          border-radius: 6px; cursor: pointer; transition: all 0.2s;
          background: ${colors.inputBg};
        }
        .radio-item:hover { border-color: ${colors.accent}; }
        .radio-item.active {
          border-color: ${colors.accent};
          background: ${dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'};
        }
        .radio-item input { display: none; }
        .radio-dot {
          width: 16px; height: 16px; border: 2px solid ${colors.border};
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .radio-item.active .radio-dot { border-color: ${colors.accent}; }
        .radio-dot::after {
          content: ''; width: 8px; height: 8px; border-radius: 50%;
          background: ${colors.accent}; opacity: 0; transition: opacity 0.2s;
        }
        .radio-item.active .radio-dot::after { opacity: 1; }
        .radio-label { font-size: 13px; color: ${colors.text}; }
        .coords-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn-locate {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; padding: 10px; margin-top: 12px;
          font-size: 13px; font-weight: 500; color: ${colors.accent};
          background: ${dark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'};
          border: 1px solid ${colors.accent}; border-radius: 6px;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-locate:hover:not(:disabled) { background: ${dark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}; }
        .btn-locate:disabled { opacity: 0.5; cursor: not-allowed; }
        .location-status {
          display: flex; align-items: center; gap: 6px;
          margin-top: 8px; padding: 8px 10px; font-size: 12px;
          color: ${colors.success};
          background: ${dark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'};
          border-radius: 6px;
        }
        .error-msg {
          display: flex; align-items: center; gap: 6px;
          margin-top: 16px; padding: 10px 12px; font-size: 13px;
          color: ${colors.error};
          background: ${dark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'};
          border-radius: 6px;
        }
        .config-footer { padding-top: 16px; border-top: 1px solid ${colors.border}; margin-top: 16px; }
        .btn-save {
          width: 100%; padding: 12px; font-size: 14px; font-weight: 500;
          color: #fff; background: ${colors.accent}; border: none;
          border-radius: 6px; cursor: pointer; transition: all 0.2s;
        }
        .btn-save:hover:not(:disabled) { background: #2563eb; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        select.form-input { cursor: pointer; }
      </style>

      <div class="config-container">
        <div class="config-header">
          <h1 class="config-title">天气配置</h1>
          <p class="config-subtitle">配置和风天气 API 以显示天气信息</p>
        </div>

        <div class="config-content">
          <!-- API 配置 -->
          <div class="config-section">
            <div class="section-header">
              ${this.iconKey}
              <span class="section-title">API 配置</span>
            </div>

            <div class="info-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                敏感字段默认隐藏。点击右侧眼睛会在当次操作时调用 <code>dataNode.app.getByKey</code> 读取并展示；不点击不会回显明文。<br>
                空值保存策略：留空不会覆盖已保存密钥。若使用自定义 Host，请先在 <code>networkDomains</code> 白名单声明对应域名。
              </div>
            </div>

            <div class="form-row">
              <div class="label-row">
                <label class="form-label">和风天气 API Key *</label>
                <span class="${this.getSecretStatusClass(this.hasSavedApiKey, this.loadingApiKey)}">
                  ${this.getSecretStatus(this.hasSavedApiKey, this.loadingApiKey)}
                </span>
              </div>
              <div class="input-wrap">
                <input class="form-input"
                  type="${this.showApiKey ? 'text' : 'password'}"
                  autocomplete="off"
                  .value="${this.apiKey}"
                  @input="${(e) => { this.apiKey = e.target.value; this.error = ''; }}"
                  placeholder="${this.getMaskedPlaceholder('和风 API Key', this.hasSavedApiKey) || '输入和风天气 API Key'}">
                <button type="button" class="btn-eye"
                  title="${this.showApiKey ? '隐藏' : '显示'}"
                  ?disabled="${this.loadingApiKey}"
                  @click="${() => this.toggleSecretVisibility('apiKey')}">
                  ${this.showApiKey ? this.iconEyeOff : this.iconEye}
                </button>
              </div>
              <div class="form-hint">在 <a href="https://dev.qweather.com" target="_blank">和风天气开发平台</a> 获取</div>
            </div>

            <div class="form-row">
              <div class="label-row">
                <label class="form-label">和风 API Host</label>
                <span class="${this.getSecretStatusClass(this.hasSavedApiHost, this.loadingApiHost)}">
                  ${this.getSecretStatus(this.hasSavedApiHost, this.loadingApiHost)}
                </span>
              </div>
              <div class="input-wrap">
                <input class="form-input"
                  type="${this.showApiHost ? 'text' : 'password'}"
                  autocomplete="off"
                  .value="${this.apiHost}"
                  @input="${(e) => { this.apiHost = e.target.value; this.error = ''; }}"
                  placeholder="${this.getMaskedPlaceholder('和风 Host', this.hasSavedApiHost) || 'devapi.qweather.com'}">
                <button type="button" class="btn-eye"
                  title="${this.showApiHost ? '隐藏' : '显示'}"
                  ?disabled="${this.loadingApiHost}"
                  @click="${() => this.toggleSecretVisibility('apiHost')}">
                  ${this.showApiHost ? this.iconEyeOff : this.iconEye}
                </button>
              </div>
              <div class="form-hint">不填时默认使用 <code>devapi.qweather.com</code></div>
            </div>

            <div class="form-row">
              <div class="label-row">
                <label class="form-label">高德地图 API Key（可选）</label>
                <span class="${this.getSecretStatusClass(this.hasSavedAmapKey, this.loadingAmapKey)}">
                  ${this.getSecretStatus(this.hasSavedAmapKey, this.loadingAmapKey)}
                </span>
              </div>
              <div class="input-wrap">
                <input class="form-input"
                  type="${this.showAmapKey ? 'text' : 'password'}"
                  autocomplete="off"
                  .value="${this.amapKey}"
                  @input="${(e) => { this.amapKey = e.target.value; this.error = ''; }}"
                  placeholder="${this.getMaskedPlaceholder('高德 Key', this.hasSavedAmapKey) || '用于自动定位时获取城市名称'}">
                <button type="button" class="btn-eye"
                  title="${this.showAmapKey ? '隐藏' : '显示'}"
                  ?disabled="${this.loadingAmapKey}"
                  @click="${() => this.toggleSecretVisibility('amapKey')}">
                  ${this.showAmapKey ? this.iconEyeOff : this.iconEye}
                </button>
              </div>
              <div class="form-hint">在 <a href="https://console.amap.com" target="_blank">高德开放平台</a> 获取，用于逆地理编码</div>
            </div>
          </div>

          <!-- 位置设置 -->
          <div class="config-section">
            <div class="section-header">
              ${this.iconLocation}
              <span class="section-title">位置设置</span>
            </div>

            <div class="form-row">
              <label class="form-label">定位方式</label>
              <div class="radio-group">
                <label class="radio-item ${this.locationMode === 'manual' ? 'active' : ''}" @click="${() => { this.locationMode = 'manual'; this.error = ''; }}">
                  <input type="radio" name="mode" value="manual" .checked="${this.locationMode === 'manual'}">
                  <span class="radio-dot"></span>
                  <span class="radio-label">城市ID</span>
                </label>
                <label class="radio-item ${this.locationMode === 'auto' ? 'active' : ''}" @click="${() => { this.locationMode = 'auto'; this.error = ''; }}">
                  <input type="radio" name="mode" value="auto" .checked="${this.locationMode === 'auto'}">
                  <span class="radio-dot"></span>
                  <span class="radio-label">经纬度</span>
                </label>
              </div>
            </div>

            <div class="form-row">
              <label class="form-label">城市名称</label>
              <input type="text" class="form-input"
                .value="${this.cityName}"
                @input="${(e) => this.cityName = e.target.value}"
                placeholder="${this.locationMode === 'auto' ? '定位后自动获取或手动输入' : '北京'}">
              <div class="form-hint">显示在卡片上的城市名称</div>
            </div>

            ${this.locationMode === 'manual' ? html`
              <div class="form-row">
                <label class="form-label">城市ID</label>
                <input type="text" class="form-input"
                  .value="${this.location}"
                  @input="${(e) => { this.location = e.target.value; this.error = ''; }}"
                  placeholder="101010100">
                <div class="form-hint">北京 101010100 / 上海 101020100 / 广州 101280101</div>
              </div>
            ` : html`
              <div class="form-row">
                <label class="form-label">坐标</label>
                <div class="coords-grid">
                  <input type="text" class="form-input"
                    .value="${this.longitude}"
                    @input="${(e) => this.longitude = e.target.value}"
                    placeholder="经度">
                  <input type="text" class="form-input"
                    .value="${this.latitude}"
                    @input="${(e) => this.latitude = e.target.value}"
                    placeholder="纬度">
                </div>
                <button type="button" class="btn-locate"
                  @click="${this.detectLocation}"
                  ?disabled="${this.locating}">
                  ${this.iconTarget}
                  ${this.locating ? '定位中...' : '获取当前位置'}
                </button>
                ${this.locationStatus ? html`
                  <div class="location-status">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    ${this.locationStatus}
                  </div>
                ` : ''}
              </div>
            `}
          </div>

          <!-- 刷新设置 -->
          <div class="config-section">
            <div class="section-header">
              ${this.iconClock}
              <span class="section-title">刷新设置</span>
            </div>

            <div class="form-row">
              <label class="form-label">刷新间隔</label>
              <select class="form-input"
                .value="${String(this.refreshInterval)}"
                @change="${(e) => this.refreshInterval = Number(e.target.value)}">
                <option value="5">5 分钟</option>
                <option value="10">10 分钟</option>
                <option value="15">15 分钟</option>
                <option value="30">30 分钟</option>
                <option value="60">60 分钟</option>
              </select>
            </div>

            <div class="form-row">
              <label class="form-label">文字颜色</label>
              <div class="radio-group">
                <label class="radio-item ${this.textMode === 'light' ? 'active' : ''}" @click="${() => this.textMode = 'light'}">
                  <input type="radio" name="textMode" value="light" .checked="${this.textMode === 'light'}">
                  <span class="radio-dot"></span>
                  <span class="radio-label">浅色</span>
                </label>
                <label class="radio-item ${this.textMode === 'dark' ? 'active' : ''}" @click="${() => this.textMode = 'dark'}">
                  <input type="radio" name="textMode" value="dark" .checked="${this.textMode === 'dark'}">
                  <span class="radio-dot"></span>
                  <span class="radio-label">深色</span>
                </label>
              </div>
              <div class="form-hint">深色背景选浅色文字，浅色背景选深色文字</div>
            </div>
          </div>

          ${this.error ? html`
            <div class="error-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              ${this.error}
            </div>
          ` : ''}
        </div>

        <div class="config-footer">
          <button type="button" class="btn-save"
            @click="${this.handleSaveOrCreateWidget}"
            ?disabled="${this.saving}">
            ${this.saving ? '保存中...' : this.getButtonTitle()}
          </button>
        </div>
      </div>
    `;
  }
}
