import { html } from 'lit';
import { SunPanelPageElement } from '@sun-panel/micro-app';

export class QbConfig extends SunPanelPageElement {
  static properties = {
    host: { type: String },
    username: { type: String },
    password: { type: String },
    refreshInterval: { type: Number },
    textMode: { type: String },
    showHost: { type: Boolean },
    showUser: { type: Boolean },
    showPass: { type: Boolean },
    hasSavedHost: { type: Boolean },
    hasSavedUser: { type: Boolean },
    hasSavedPass: { type: Boolean },
    loading: { type: Boolean },
    saving: { type: Boolean },
    error: { type: String },
    testStatus: { type: String },
    testing: { type: Boolean }
  };

  constructor() {
    super();
    this.host = '';
    this.username = '';
    this.password = '';
    this.refreshInterval = 5;
    this.textMode = 'light';
    this.showHost = false;
    this.showUser = false;
    this.showPass = false;
    this.hasSavedHost = false;
    this.hasSavedUser = false;
    this.hasSavedPass = false;
    this.loading = false;
    this.saving = false;
    this.error = '';
    this.testStatus = '';
    this.testing = false;
  }

  async onInitialized({ widgetInfo }) {
    const cfg = widgetInfo?.config || {};
    this.refreshInterval = cfg.refreshInterval || 5;
    this.textMode = cfg.textMode || 'light';
    this.hasSavedHost = Boolean(cfg.hasSavedHost);
    this.hasSavedUser = Boolean(cfg.hasSavedUser);
    this.hasSavedPass = Boolean(cfg.hasSavedPass);
  }

  async toggleSecret(name) {
    const map = {
      host: { show: 'showHost', saved: 'hasSavedHost', value: 'host', key: 'host' },
      user: { show: 'showUser', saved: 'hasSavedUser', value: 'username', key: 'username' },
      pass: { show: 'showPass', saved: 'hasSavedPass', value: 'password', key: 'password' }
    };
    const m = map[name];
    if (this[m.show]) { this[m.show] = false; return; }
    if (this[m.value]) { this[m.show] = true; return; }

    this.loading = true;
    try {
      const val = await this.spCtx.api.dataNode.app.getByKey('config', m.key);
      if (val) { this[m.value] = val; this[m.saved] = true; }
      this[m.show] = true;
    } catch (e) {
      if (String(e?.message).includes('not found')) this[m.saved] = false;
    } finally { this.loading = false; }
  }

  async testConnection() {
    const hostVal = this.host.trim();
    const userVal = this.username.trim();
    const passVal = this.password;

    // 检查是否有可用的配置
    if (!hostVal && !this.hasSavedHost) { this.error = '请输入 QB 地址'; return; }
    if (!userVal && !this.hasSavedUser) { this.error = '请输入用户名'; return; }
    if (!passVal && !this.hasSavedPass) { this.error = '请输入密码'; return; }

    this.testing = true;
    this.testStatus = '测试中...';
    this.error = '';
    this.requestUpdate();
    try {
      // 只保存有新输入的配置
      console.log('[QB] 新输入:', { host: hostVal || '(使用已保存)', username: userVal || '(使用已保存)', password: passVal ? '***' : '(使用已保存)' });
      if (hostVal) await this.spCtx.api.dataNode.app.setByKey('config', 'host', hostVal);
      if (userVal) await this.spCtx.api.dataNode.app.setByKey('config', 'username', userVal);
      if (passVal) await this.spCtx.api.dataNode.app.setByKey('config', 'password', passVal);
      console.log('[QB] 开始登录...');

      // 调试：读取 dataNode 确认值
      let savedHost, savedUser, savedPass;
      try {
        savedHost = (await this.spCtx.api.dataNode.app.getByKey('config', 'host')).replace(/\/+$/, '');
        savedUser = await this.spCtx.api.dataNode.app.getByKey('config', 'username');
        savedPass = await this.spCtx.api.dataNode.app.getByKey('config', 'password');
        console.log('[QB] dataNode 中的值:', { host: savedHost, username: savedUser, password: savedPass ? savedPass.substring(0, 2) + '***' : '(empty)' });
      } catch (e) {
        console.log('[QB] 读取 dataNode 失败:', e.message);
        throw new Error('无法读取配置');
      }

      // 登录请求体
      const loginBody = `username=${savedUser}&password=${savedPass}`;
      console.log('[QB] 登录请求体:', loginBody.replace(/password=[^&]+/, 'password=***'), '长度:', loginBody.length);
      const loginRes = await this.spCtx.api.network.request({
        targetUrl: savedHost + '/api/v2/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': String(loginBody.length),
          'Connection': 'close',
          'Referer': savedHost + '/',
          'Origin': savedHost
        },
        body: loginBody
      });
      console.log('[QB] login response:', loginRes);
      console.log('[QB] login response data:', loginRes?.data);
      console.log('[QB] login response headers:', loginRes?.headers);

      // 从响应头获取 SID cookie
      const setCookie = loginRes?.headers?.['set-cookie'] || loginRes?.headers?.['Set-Cookie'];
      let sid = '';
      if (setCookie) {
        const match = String(setCookie).match(/SID=([^;]+)/);
        if (match) sid = match[1];
      }
      console.log('[QB] SID:', sid);

      // 保存 SID
      if (sid) await this.spCtx.api.dataNode.app.setByKey('config', 'sid', sid);

      const res = await this.spCtx.api.network.request({
        targetUrl: savedHost + '/api/v2/app/version',
        method: 'GET',
        headers: sid ? { 'Cookie': `SID=${sid}` } : {}
      });
      this.testStatus = `连接成功! QB版本: ${res?.data || res}`;
      this.hasSavedHost = true;
      this.hasSavedUser = true;
      this.hasSavedPass = true;
    } catch (e) {
      this.testStatus = '';
      this.error = '连接失败: ' + (e?.message || '未知错误');
    } finally {
      this.testing = false;
    }
  }

  async handleSave() {
    const hostVal = this.host.trim();
    if (!hostVal && !this.hasSavedHost) { this.error = '请输入 QB 地址'; return; }

    this.saving = true;
    this.error = '';
    try {
      let hasSavedHost = this.hasSavedHost, hasSavedUser = this.hasSavedUser, hasSavedPass = this.hasSavedPass;

      if (hostVal) { await this.spCtx.api.dataNode.app.setByKey('config', 'host', hostVal); hasSavedHost = true; }
      if (this.username.trim()) { await this.spCtx.api.dataNode.app.setByKey('config', 'username', this.username.trim()); hasSavedUser = true; }
      if (this.password) { await this.spCtx.api.dataNode.app.setByKey('config', 'password', this.password); hasSavedPass = true; }

      await this.spCtx.api.widget.save({
        ...this.spCtx.widgetInfo,
        config: { refreshInterval: this.refreshInterval, textMode: this.textMode, hasSavedHost, hasSavedUser, hasSavedPass }
      });

      this.hasSavedHost = hasSavedHost;
      this.hasSavedUser = hasSavedUser;
      this.hasSavedPass = hasSavedPass;
    } catch (e) {
      this.error = '保存失败: ' + (e?.message || '未知错误');
    } finally { this.saving = false; }
  }

  get iconEye() { return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>`; }
  get iconEyeOff() { return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.85 21.85 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`; }
  get iconLink() { return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`; }
  get iconGear() { return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`; }
  get iconPlug() { return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>`; }
  get iconCheck() { return html`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`; }
  get iconWarn() { return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`; }

  getStatus(saved) { return saved ? '已保存' : '未保存'; }
  getStatusClass(saved) { return saved ? 'status saved' : 'status empty'; }
  getPlaceholder(name, saved) { return saved ? `•••••• 已保存（点击眼睛查看${name}）` : `输入${name}`; }

  render() {
    const dark = this.spCtx?.darkMode ?? false;
    const c = {
      bg: dark ? '#1a1a1a' : '#fff', card: dark ? '#242424' : '#f8f9fa',
      border: dark ? '#333' : '#e5e7eb', text: dark ? '#e5e5e5' : '#1f2937',
      sub: dark ? '#a0a0a0' : '#6b7280', accent: '#3b82f6', input: dark ? '#1a1a1a' : '#fff'
    };

    return html`
      <style>
        :host { display:block; height:100%; width:100%; }
        * { box-sizing:border-box; }
        .wrap { height:100%; padding:20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:${c.text}; background:${c.bg}; display:flex; flex-direction:column; }
        .title { font-size:18px; font-weight:600; margin:0 0 4px; }
        .subtitle { font-size:13px; color:${c.sub}; margin:0 0 20px; }
        .section { background:${c.card}; border:1px solid ${c.border}; border-radius:8px; padding:16px; margin-bottom:16px; }
        .section-title { font-size:13px; font-weight:500; color:${c.sub}; text-transform:uppercase; letter-spacing:.5px; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .row { margin-bottom:16px; }
        .row:last-child { margin-bottom:0; }
        .label-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
        .label { font-size:13px; font-weight:500; }
        .status { font-size:11px; padding:2px 8px; border-radius:999px; }
        .status.saved { color:${dark?'#86efac':'#166534'}; background:${dark?'rgba(34,197,94,.12)':'#f0fdf4'}; border:1px solid ${dark?'rgba(34,197,94,.35)':'#86efac'}; }
        .status.empty { color:${c.sub}; background:${dark?'rgba(255,255,255,.04)':'#f9fafb'}; border:1px solid ${c.border}; }
        .input-row { display:grid; grid-template-columns:1fr 42px; gap:8px; }
        input, select { width:100%; padding:10px 12px; font-size:14px; border:1px solid ${c.border}; border-radius:6px; background:${c.input}; color:${c.text}; }
        input:focus, select:focus { outline:none; border-color:${c.accent}; }
        .btn-eye { height:40px; border:1px solid ${c.border}; background:${c.input}; color:${c.sub}; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .btn-eye:hover { color:${c.accent}; border-color:${c.accent}; }
        .hint { font-size:12px; color:${c.sub}; margin-top:4px; }
        .radio-group { display:flex; gap:12px; }
        .radio-item { flex:1; display:flex; align-items:center; gap:8px; padding:10px 12px; border:1px solid ${c.border}; border-radius:6px; cursor:pointer; background:${c.input}; }
        .radio-item:hover { border-color:${c.accent}; }
        .radio-item.active { border-color:${c.accent}; background:${dark?'rgba(59,130,246,.1)':'rgba(59,130,246,.05)'}; }
        .radio-dot { width:16px; height:16px; border:2px solid ${c.border}; border-radius:50%; display:flex; align-items:center; justify-content:center; }
        .radio-item.active .radio-dot { border-color:${c.accent}; }
        .radio-dot::after { content:''; width:8px; height:8px; border-radius:50%; background:${c.accent}; opacity:0; }
        .radio-item.active .radio-dot::after { opacity:1; }
        .btn-test { padding:10px; font-size:13px; color:${c.accent}; background:${dark?'rgba(59,130,246,.1)':'rgba(59,130,246,.05)'}; border:1px solid ${c.accent}; border-radius:6px; cursor:pointer; margin-top:12px; }
        .btn-test:hover { background:${dark?'rgba(59,130,246,.2)':'rgba(59,130,246,.1)'}; }
        .test-ok { margin-top:8px; padding:8px 10px; font-size:12px; color:#22c55e; background:${dark?'rgba(34,197,94,.1)':'rgba(34,197,94,.05)'}; border-radius:6px; }
        .error { margin-top:16px; padding:10px 12px; font-size:13px; color:#ef4444; background:${dark?'rgba(239,68,68,.1)':'rgba(239,68,68,.05)'}; border-radius:6px; }
        .footer { padding-top:16px; border-top:1px solid ${c.border}; margin-top:auto; }
        .btn-save { width:100%; padding:12px; font-size:14px; font-weight:500; color:#fff; background:${c.accent}; border:none; border-radius:6px; cursor:pointer; }
        .btn-save:hover { background:#2563eb; }
        .btn-save:disabled { opacity:.5; cursor:not-allowed; }
      </style>
      <div class="wrap">
        <h1 class="title">QB下载器配置</h1>
        <p class="subtitle">配置 qBittorrent WebUI 连接信息</p>

        <div class="section">
          <div class="section-title">${this.iconLink} 连接设置</div>
          ${this.renderSecretField('host', 'QB 地址', 'http://192.168.1.100:8080')}
          ${this.renderSecretField('user', '用户名', 'admin')}
          ${this.renderSecretField('pass', '密码', '••••••')}
          <button class="btn-test" @click=${this.testConnection} ?disabled=${this.testing}>${this.iconPlug} ${this.testing ? '测试中...' : '测试连接'}</button>
          ${this.testStatus ? html`<div class="test-ok">${this.iconCheck} ${this.testStatus}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">${this.iconGear} 显示设置</div>
          <div class="row">
            <div class="label">刷新间隔</div>
            <select .value=${String(this.refreshInterval)} @change=${e => this.refreshInterval = Number(e.target.value)}>
              <option value="3">3 秒</option><option value="5">5 秒</option><option value="10">10 秒</option><option value="30">30 秒</option>
            </select>
          </div>
          <div class="row">
            <div class="label">文字颜色</div>
            <div class="radio-group">
              <label class="radio-item ${this.textMode==='light'?'active':''}" @click=${()=>this.textMode='light'}><span class="radio-dot"></span>浅色</label>
              <label class="radio-item ${this.textMode==='dark'?'active':''}" @click=${()=>this.textMode='dark'}><span class="radio-dot"></span>深色</label>
            </div>
            <div class="hint">深色背景选浅色文字，浅色背景选深色文字</div>
          </div>
        </div>

        ${this.error ? html`<div class="error">${this.iconWarn} ${this.error}</div>` : ''}

        <div class="footer">
          <button class="btn-save" @click=${this.handleSave} ?disabled=${this.saving}>${this.saving ? '保存中...' : '保存'}</button>
        </div>
      </div>
    `;
  }

  renderSecretField(name, label, placeholder) {
    const map = { host: ['showHost','hasSavedHost','host'], user: ['showUser','hasSavedUser','username'], pass: ['showPass','hasSavedPass','password'] };
    const [showKey, savedKey, valueKey] = map[name];
    const isPass = name === 'pass';
    return html`
      <div class="row">
        <div class="label-row"><span class="label">${label}</span><span class="${this.getStatusClass(this[savedKey])}">${this.getStatus(this[savedKey])}</span></div>
        <div class="input-row">
          <input type="${this[showKey] && !isPass ? 'text' : 'password'}" .value=${this[valueKey]} @input=${e => { this[valueKey] = e.target.value; this.error = ''; }} placeholder=${this.getPlaceholder(label, this[savedKey]) || placeholder}>
          <button class="btn-eye" @click=${() => this.toggleSecret(name)}>${this[showKey] ? this.iconEyeOff : this.iconEye}</button>
        </div>
      </div>
    `;
  }
}
