import { html } from 'lit';
import { SunPanelWidgetElement } from '@sun-panel/micro-app';
import { PetState } from '../utils/pet-state.js';
import { generatePetSvg } from '../utils/pet-sprites.js';
import { getDialogue } from '../utils/pet-data.js';

export class PixelPetWidget extends SunPanelWidgetElement {
  static properties = {
    state: { type: Object },
    action: { type: String },
    frame: { type: Number },
    dialogue: { type: String },
    showBubble: { type: Boolean },
    config: { type: Object },
    lastChange: { type: String },
    changeColor: { type: String },
    hovering: { type: Boolean },
    petX: { type: Number },
    petDir: { type: Number },
    inScene: { type: Boolean }
  };

  constructor() {
    super();
    this.state = PetState.create();
    this.action = 'idle';
    this.frame = 0;
    this.dialogue = '';
    this.showBubble = false;
    this.config = {};
    this.lastChange = '';
    this.changeColor = '#22c55e';
    this.hovering = false;
    this.petX = 80;
    this.petDir = 1;
    this.inScene = false;
    this.sceneIdx = Math.floor(Math.random() * 4);
  }

  get petType() { return this.config.petType || 'cat'; }
  get petName() { return this.config.petName || '宠物'; }
  get personality() { return this.config.personality || 'cheerful'; }
  get tagStyle() { return this.config.tagStyle || 0; }
  get petStyle() { return this.config.petStyle || 'cute'; }

  get stateKey() {
    return `state-${this.spCtx.widgetInfo?.id || 'default'}`;
  }

  async onInitialized() {
    this.makeTransparent();
    this.config = this.spCtx.widgetInfo?.config || {};
    try {
      const saved = await this.spCtx.api.dataNode.app.getByKey('pet-state', this.stateKey);
      console.log('[pet] loaded:', this.stateKey, saved);
      if (saved && saved.hunger !== undefined) this.state = PetState.decay(saved);
    } catch (e) { console.log('[pet] load error:', e); }
    this._timer = setInterval(() => {
      this.state = PetState.decay(this.state);
      this.maybeSpeak();
      this.requestUpdate();
    }, 30000);
    this._animTimer = setInterval(() => {
      this.frame = (this.frame + 1) % 24;
      // 宠物自由移动（2x4模式下可以跑到右边场景）
      if (this.action === 'idle' && Math.random() < 0.25) {
        this.petX += this.petDir * 10;
        if (this.petX > 300) { this.petX = 300; this.petDir = -1; }
        if (this.petX < 20) { this.petX = 20; this.petDir = 1; }
        this.inScene = this.petX > 160;
      }
      this.requestUpdate();
    }, 250);
    setTimeout(() => this.speak(PetState.getMood(this.state)), 2000);
  }

  onWidgetInfoChanged(newInfo) {
    this.config = newInfo?.config || {};
    this.requestUpdate();
  }

  makeTransparent() {
    let el = this.parentElement;
    while (el) {
      if (el.classList?.contains('item-card-content') || el.classList?.contains('widget-container')) {
        el.style.background = 'transparent';
        el.style.backgroundColor = 'transparent';
      }
      el = el.parentElement;
    }
  }

  onDisconnected() {
    clearInterval(this._timer);
    clearInterval(this._animTimer);
  }

  updated() { this.makeTransparent(); }

  async save() {
    try {
      const result = await this.spCtx.api.dataNode.app.setByKey('pet-state', this.stateKey, this.state);
      console.log('[pet] save result:', result, 'key:', this.stateKey, 'state:', this.state);
    } catch (e) { console.log('[pet] save error:', e, e?.code, e?.message); }
  }

  speak(state) {
    this.dialogue = getDialogue(state, this.personality);
    this.showBubble = true;
    clearTimeout(this._bubbleTimer);
    this._bubbleTimer = setTimeout(() => { this.showBubble = false; this.requestUpdate(); }, 3000);
  }

  maybeSpeak() {
    if (Math.random() < 0.4) this.speak(PetState.getMood(this.state));
  }

  showChange(text, ok = true) {
    this.lastChange = text;
    this.changeColor = ok ? '#22c55e' : '#ef4444';
    clearTimeout(this._changeTimer);
    this._changeTimer = setTimeout(() => { this.lastChange = ''; this.requestUpdate(); }, 1500);
  }

  async doAction(actionFn, okAction, okState) {
    const { state, result, msg } = actionFn.call(PetState, this.state);
    this.state = state;
    if (result === 'ok') {
      this.action = okAction;
      this.speak(okState);
      this.showChange(msg, true);
    } else {
      this.action = 'sad';
      this.speak('refuse');
      this.showChange(msg, false);
    }
    await this.save();
    setTimeout(() => { this.action = 'idle'; this.requestUpdate(); }, 1500);
  }

  doFeed() { this.doAction(PetState.feed, 'eat', 'feed'); }
  doPlay() { this.doAction(PetState.play, 'jump', 'play'); }
  doPet() { this.doAction(PetState.pet, 'happy', 'pet'); }
  doHeal() { this.doAction(PetState.heal, 'happy', 'happy'); }

  get petSvg() {
    const mood = this.action !== 'idle' ? this.action : PetState.getMood(this.state);
    return generatePetSvg(this.petType, mood, this.frame, this.petStyle);
  }

  getMoodText(mood) {
    const texts = { happy: '😊 心情愉快', idle: '😐 状态一般', sad: '😢 有点难过', hungry: '🍽️ 肚子饿了', sick: '🤒 身体不适', sleep: '😴 昏昏欲睡' };
    return texts[mood] || '😐 状态一般';
  }

  getMoodDesc(mood, s) {
    if (mood === 'sick') return `健康值过低，需要治疗恢复。当前健康: ${s.health}`;
    if (mood === 'hungry') return `饱食度不足，快喂点东西吧！当前饱食: ${s.hunger}`;
    if (mood === 'happy') return `${this.petName}现在很开心，继续保持互动吧~`;
    if (mood === 'sad') return `心情不太好，多陪陪${this.petName}玩耍吧`;
    return `${this.petName}状态还不错，记得定期互动哦`;
  }

  get baseStyle() {
    return `
      :host { display:block; width:100%; height:100%; }
      * { box-sizing:border-box; }
      @keyframes breathe { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
      @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes fadeUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-10px)} }
      @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)} }
      .wrap { position:relative; }
      .wrap:hover .float-btns { opacity:1; pointer-events:auto; }
      .pet-svg { cursor:pointer; transition:transform .15s; }
      .pet-svg:hover { transform:scale(1.05); }
      .pet-svg svg { width:100%; height:100%; animation: ${this.action==='jump'?'bounce .25s infinite':this.action==='sad'?'shake .3s':'breathe 2s ease-in-out infinite'}; }
      .bubble { position:absolute; background:#fff; padding:5px 12px; border-radius:12px; font-size:12px; box-shadow:0 2px 8px rgba(0,0,0,.15); white-space:nowrap; z-index:20; opacity:${this.showBubble?1:0}; transition:opacity .3s; pointer-events:none; }
      .change { position:absolute; font-size:12px; font-weight:600; animation:fadeUp 1.5s forwards; pointer-events:none; z-index:15; }
      .bar { height:5px; background:rgba(0,0,0,.08); border-radius:3px; overflow:hidden; cursor:pointer; }
      .bar-fill { height:100%; border-radius:3px; transition:width .3s; }
      .bar-wrap { position:relative; }
      .bar-wrap:hover .bar-tip { opacity:1; }
      .bar-tip { position:absolute; top:-22px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:2px 6px; border-radius:4px; font-size:9px; white-space:nowrap; opacity:0; transition:opacity .2s; pointer-events:none; z-index:100; }
      .float-btns { position:absolute; display:flex; gap:6px; opacity:0; pointer-events:none; transition:opacity .2s; z-index:10; }
      .btn { position:relative; width:30px; height:30px; border:none; background:rgba(255,255,255,.95); border-radius:50%; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.12); font-size:13px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
      .btn:hover { transform:scale(1.1); background:#fff; }
      .btn:active { transform:scale(0.95); }
      .btn:hover::after { content:attr(data-tip); position:absolute; bottom:100%; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:3px 8px; border-radius:4px; font-size:10px; white-space:nowrap; margin-bottom:4px; }
      .name-tag { display:inline-block; padding:2px 8px; font-size:10px; font-weight:600; }
      .tag-0 { background:#fff9e6; color:#d97706; border-radius:3px 8px 8px 3px; border:1.5px solid #fbbf24; border-left:3px solid #f59e0b; }
      .tag-1 { background:#e0f2fe; color:#0284c7; border-radius:10px; border:1.5px solid #7dd3fc; }
      .tag-2 { background:#fce7f3; color:#db2777; border-radius:0 8px 0 8px; border:1.5px solid #f9a8d4; }
      .tag-3 { background:#ecfccb; color:#65a30d; border-radius:8px 0 8px 0; border:1.5px solid #bef264; }
      .hunger .bar-fill { background:linear-gradient(90deg,#fbbf24,#f59e0b); }
      .happy .bar-fill { background:linear-gradient(90deg,#a78bfa,#8b5cf6); }
      .love .bar-fill { background:linear-gradient(90deg,#fb7185,#ef4444); }
      .health .bar-fill { background:linear-gradient(90deg,#34d399,#10b981); }
    `;
  }

  render2x2() {
    const s = this.state;
    const sick = s.health < 50;
    return html`
      <style>
        ${this.baseStyle}
        .wrap { width:174px; height:174px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4px; }
        .pet-area { position:relative; flex:1; display:flex; align-items:center; justify-content:center; width:100%; }
        .pet-svg { width:140px; height:140px; }
        .bubble { top:0; left:50%; transform:translateX(-50%); }
        .change { top:18px; left:50%; transform:translateX(-50%); color:${this.changeColor}; }
        .float-btns { bottom:5px; left:50%; transform:translateX(-50%); }
        .bottom { display:flex; align-items:center; gap:6px; }
        .bars { display:flex; gap:4px; }
        .bar { width:26px; }
        .bar-tip { top:auto; bottom:12px; }
      </style>
      <div class="wrap">
        <div class="pet-area">
          <div class="bubble">${this.dialogue}</div>
          <div class="pet-svg" @click=${()=>this.doPet()} .innerHTML=${this.petSvg}></div>
          ${this.lastChange ? html`<div class="change">${this.lastChange}</div>` : ''}
          <div class="float-btns">
            <button class="btn" @click=${()=>this.doFeed()} data-tip="喂食">🍖</button>
            <button class="btn" @click=${()=>this.doPlay()} data-tip="玩耍">⚽</button>
            ${sick ? html`<button class="btn" @click=${()=>this.doHeal()} data-tip="治疗">💊</button>` : ''}
          </div>
        </div>
        <div class="bottom">
          <span class="name-tag tag-${this.tagStyle}">${this.petName}</span>
          <div class="bars">
            <div class="bar-wrap hunger"><div class="bar"><div class="bar-fill" style="width:${s.hunger}%"></div></div><span class="bar-tip">饱食 ${s.hunger}</span></div>
            <div class="bar-wrap happy"><div class="bar"><div class="bar-fill" style="width:${s.happiness}%"></div></div><span class="bar-tip">心情 ${s.happiness}</span></div>
            <div class="bar-wrap love"><div class="bar"><div class="bar-fill" style="width:${s.affection}%"></div></div><span class="bar-tip">好感 ${s.affection}</span></div>
            ${sick ? html`<div class="bar-wrap health"><div class="bar"><div class="bar-fill" style="width:${s.health}%"></div></div><span class="bar-tip">健康 ${s.health}</span></div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  get sceneSvg() {
    const scenes = [
      `<circle fill="#fff" cx="40" cy="25" r="15" opacity=".7"/><circle fill="#fff" cx="55" cy="22" r="10" opacity=".7"/><circle fill="#fff" cx="150" cy="30" r="18" opacity=".6"/><circle fill="#fff" cx="168" cy="26" r="10" opacity=".6"/><ellipse fill="#90EE90" cx="98" cy="165" rx="100" ry="20" opacity=".4"/>`,
      `<circle fill="#FFD700" cx="30" cy="20" r="2" opacity=".8"/><circle fill="#FFD700" cx="80" cy="35" r="1.5" opacity=".7"/><circle fill="#FFD700" cx="120" cy="15" r="2" opacity=".9"/><circle fill="#FFD700" cx="160" cy="40" r="1.5" opacity=".6"/><circle fill="#FFD700" cx="50" cy="50" r="1" opacity=".5"/><circle fill="#fff" cx="170" cy="25" r="12" opacity=".3"/>`,
      `<path d="M20 140 Q98 60 176 140" stroke="#ff6b6b" stroke-width="6" fill="none" opacity=".3"/><path d="M25 140 Q98 70 171 140" stroke="#ffd93d" stroke-width="6" fill="none" opacity=".3"/><path d="M30 140 Q98 80 166 140" stroke="#6bcb77" stroke-width="6" fill="none" opacity=".3"/>`,
      `<ellipse fill="#f39c12" cx="40" cy="60" rx="8" ry="4" opacity=".6" transform="rotate(30 40 60)"/><ellipse fill="#e74c3c" cx="100" cy="40" rx="6" ry="3" opacity=".5" transform="rotate(-20 100 40)"/><ellipse fill="#f39c12" cx="150" cy="80" rx="7" ry="3.5" opacity=".6" transform="rotate(45 150 80)"/><ellipse fill="#90EE90" cx="98" cy="165" rx="100" ry="20" opacity=".4"/>`
    ];
    return `<svg viewBox="0 0 196 174" xmlns="http://www.w3.org/2000/svg">${scenes[this.sceneIdx || 0]}</svg>`;
  }

  render2x4() {
    const s = this.state;
    const sick = s.health < 50;
    const petLeft = this.petX;
    return html`
      <style>
        ${this.baseStyle}
        .wrap { width:370px; height:174px; position:relative; }
        .scene-bg { position:absolute; right:0; top:0; width:196px; height:174px; border-radius:0 12px 12px 0; overflow:hidden; }
        .scene-bg svg { width:100%; height:100%; }
        .home { position:absolute; left:0; top:0; width:174px; height:174px; }
        .moving-pet { position:absolute; bottom:20px; width:120px; height:120px; transition:left .3s; cursor:pointer; z-index:5; }
        .moving-pet svg { width:100%; height:100%; }
        .moving-pet.flip svg { transform:scaleX(-1); }
        .pet-bubble { position:absolute; bottom:95px; background:#fff; padding:4px 10px; border-radius:10px; font-size:11px; box-shadow:0 2px 6px rgba(0,0,0,.12); white-space:nowrap; z-index:10; opacity:${this.showBubble?1:0}; transition:opacity .3s, left .3s; }
        .change { bottom:100px; z-index:15; }
        .bottom { position:relative; z-index:2; display:flex; align-items:center; gap:6px; }
        .bars { display:flex; gap:4px; }
        .bar { width:26px; }
        .bar-tip { top:auto; bottom:12px; }
        .float-btns { position:absolute; bottom:5px; right:10px; transform:none; }
      </style>
      <div class="wrap">
        <div class="scene-bg" .innerHTML=${this.sceneSvg}></div>
        <div class="home"></div>
        <div class="pet-bubble" style="left:${petLeft - 15}px">${this.dialogue}</div>
        <div class="moving-pet ${this.petDir < 0 ? 'flip' : ''}" style="left:${petLeft}px" @click=${()=>this.doPet()} .innerHTML=${this.petSvg}></div>
        ${this.lastChange ? html`<div class="change" style="left:${petLeft + 20}px;color:${this.changeColor}">${this.lastChange}</div>` : ''}
        <div class="float-btns">
          <button class="btn" @click=${()=>this.doFeed()} data-tip="喂食">🍖</button>
          <button class="btn" @click=${()=>this.doPlay()} data-tip="玩耍">⚽</button>
          ${sick ? html`<button class="btn" @click=${()=>this.doHeal()} data-tip="治疗">💊</button>` : ''}
        </div>
        <div class="bottom" style="position:absolute;bottom:4px;left:4px;">
          <span class="name-tag tag-${this.tagStyle}">${this.petName}</span>
          <div class="bars">
            <div class="bar-wrap hunger"><div class="bar"><div class="bar-fill" style="width:${s.hunger}%"></div></div><span class="bar-tip">饱食 ${s.hunger}</span></div>
            <div class="bar-wrap happy"><div class="bar"><div class="bar-fill" style="width:${s.happiness}%"></div></div><span class="bar-tip">心情 ${s.happiness}</span></div>
            <div class="bar-wrap love"><div class="bar"><div class="bar-fill" style="width:${s.affection}%"></div></div><span class="bar-tip">好感 ${s.affection}</span></div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const size = this.spCtx?.widgetInfo?.gridSize || '2x2';
    return size === '2x4' ? this.render2x4() : this.render2x2();
  }
}
