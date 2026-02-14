import { html } from 'lit';
import { SunPanelPageElement } from '@sun-panel/micro-app';

export class WeatherConfig extends SunPanelPageElement {
  static properties = {
    widgetInfo: { type: Object },
    apiKey: { type: String },
    apiHost: { type: String },
    amapKey: { type: String },
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
    this.apiHost = 'devapi.qweather.com';
    this.amapKey = '';
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
    if (config.apiKey) {
      this.apiKey = config.apiKey;
      this.apiHost = config.apiHost || 'devapi.qweather.com';
      this.amapKey = config.amapKey || '';
      this.locationMode = config.locationMode || 'manual';
      this.location = config.location || '101010100';
      this.cityName = config.cityName || '北京';
      this.longitude = config.longitude || '';
      this.latitude = config.latitude || '';
      this.refreshInterval = config.refreshInterval || 15;
      this.textMode = config.textMode || 'light';
    } else {
      try {
        // 从数据节点读取配置（apiKey 在 config 对象内）
        const settings = await this.spCtx.api.dataNode.user.getByKey('settings', 'config');
        if (settings) {
          this.apiKey = settings.apiKey || '';
          this.apiHost = settings.apiHost || 'devapi.qweather.com';
          this.amapKey = settings.amapKey || '';
          this.locationMode = settings.locationMode || 'manual';
          this.location = settings.location || '101010100';
          this.cityName = settings.cityName || '北京';
          this.longitude = settings.longitude || '';
          this.latitude = settings.latitude || '';
          this.refreshInterval = settings.refreshInterval || 15;
          this.textMode = settings.textMode || 'light';
        }
      } catch (e) {
        // 配置加载失败，使用默认值
      }
    }
    this.requestUpdate();
  }

  async reverseGeocodeAMap(longitude, latitude) {
    if (!this.amapKey) {
      return null;
    }
    try {
      const response = await this.spCtx.api.network.request({
        targetUrl: `https://restapi.amap.com/v3/geocode/regeo?key=${this.amapKey}&location=${longitude},${latitude}&extensions=base`
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

      // 尝试使用高德API获取城市名
      if (this.amapKey) {
        this.locationStatus = '正在获取城市名称...';
        const cityName = await this.reverseGeocodeAMap(this.longitude, this.latitude);
        if (cityName) {
          this.cityName = cityName;
          this.locationStatus = `定位成功: ${cityName} (${this.longitude}, ${this.latitude})`;
        } else {
          this.locationStatus = `定位成功: ${this.longitude}, ${this.latitude}`;
        }
      } else {
        this.locationStatus = `定位成功: ${this.longitude}, ${this.latitude}`;
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
    if (!this.apiKey.trim()) {
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
      // 配置数据
      const configData = {
        apiHost: this.apiHost.trim() || 'devapi.qweather.com',
        amapKey: this.amapKey.trim(),
        locationMode: this.locationMode,
        location: this.location.trim(),
        cityName: this.cityName.trim() || '未知',
        longitude: this.longitude,
        latitude: this.latitude,
        refreshInterval: this.refreshInterval,
        textMode: this.textMode,
        locationValue
      };

      // 调试：打印要存储的数据
      console.log('[WeatherConfig] 准备存储 apiKey (包装为对象):', this.apiKey.trim());

      // apiKey 单独存储为一个 key（value 必须是对象）
      // templateReplacements 的 dataNode 格式：节点名.key -> settings.apiKey
      const apiKeyResult = await this.spCtx.api.dataNode.user.setByKey('settings', 'apiKey', { value: this.apiKey.trim() });
      console.log('[WeatherConfig] apiKey setByKey 返回结果:', apiKeyResult);

      // 其他配置存储
      const configResult = await this.spCtx.api.dataNode.user.setByKey('settings', 'config', configData);
      console.log('[WeatherConfig] config setByKey 返回结果:', configResult);

      // 验证：读取刚存储的数据
      try {
        const readApiKey = await this.spCtx.api.dataNode.user.getByKey('settings', 'apiKey');
        console.log('[WeatherConfig] getByKey apiKey 读取结果:', readApiKey);
        console.log('[WeatherConfig] readApiKey.value:', readApiKey?.value);
      } catch (err) {
        console.error('[WeatherConfig] getByKey apiKey 失败:', err);
      }

      // 保存 widget 配置（前端使用）
      this.spCtx.api.widget.save({
        ...this.widgetInfo,
        config: { ...configData, apiKey: this.apiKey.trim() }
      });
      console.log('[WeatherConfig] widget.save 完成');
    } catch (e) {
      console.error('[WeatherConfig] 保存失败:', e);
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
        .form-label { display: block; font-size: 13px; font-weight: 500; color: ${colors.text}; margin-bottom: 6px; }
        .form-input {
          width: 100%; padding: 10px 12px; font-size: 14px;
          border: 1px solid ${colors.border}; border-radius: 6px;
          background: ${colors.inputBg}; color: ${colors.text};
          transition: border-color 0.2s;
        }
        .form-input:focus { outline: none; border-color: ${colors.accent}; }
        .form-input::placeholder { color: ${colors.textSecondary}; }
        .form-hint { font-size: 12px; color: ${colors.textSecondary}; margin-top: 4px; }
        .form-hint a { color: ${colors.accent}; text-decoration: none; }
        .info-box {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 12px; margin-bottom: 16px; font-size: 12px;
          color: ${dark ? '#fbbf24' : '#b45309'};
          background: ${dark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)'};
          border: 1px solid ${dark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.4)'};
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
                请确保 API 域名已添加到微应用的网络白名单中，否则无法正常请求数据。<br>
                当前已配置: <code>devapi.qweather.com</code> <code>api.qweather.com</code> <code>restapi.amap.com</code>
              </div>
            </div>

            <div class="form-row">
              <label class="form-label">和风天气 API Key *</label>
              <input type="text" class="form-input"
                .value="${this.apiKey}"
                @input="${(e) => { this.apiKey = e.target.value; this.error = ''; }}"
                placeholder="输入和风天气 API Key">
              <div class="form-hint">在 <a href="https://dev.qweather.com" target="_blank">和风天气开发平台</a> 获取</div>
            </div>

            <div class="form-row">
              <label class="form-label">API Host</label>
              <input type="text" class="form-input"
                .value="${this.apiHost}"
                @input="${(e) => this.apiHost = e.target.value}"
                placeholder="devapi.qweather.com">
              <div class="form-hint">参考和风天气官方文档</div>
            </div>

            <div class="form-row">
              <label class="form-label">高德地图 API Key (可选)</label>
              <input type="text" class="form-input"
                .value="${this.amapKey}"
                @input="${(e) => this.amapKey = e.target.value}"
                placeholder="用于自动定位时获取城市名称">
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
