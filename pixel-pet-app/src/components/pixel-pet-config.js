import { html } from 'lit';
import { SunPanelPageElement } from '@sun-panel/micro-app';
import { PET_TYPES, PERSONALITIES } from '../utils/pet-data.js';
import { generatePetSvg } from '../utils/pet-sprites.js';

export class PixelPetConfig extends SunPanelPageElement {
  static properties = {
    petType: { type: String },
    petName: { type: String },
    personality: { type: String },
    tagStyle: { type: Number },
    petStyle: { type: String },
    step: { type: Number }
  };

  constructor() {
    super();
    this.petType = 'cat';
    this.petName = '';
    this.personality = 'cheerful';
    this.tagStyle = 0;
    this.petStyle = 'cute';
    this.step = 1;
  }

  async onInitialized({ widgetInfo }) {
    const cfg = widgetInfo?.config || {};
    if (cfg.petType) this.petType = cfg.petType;
    if (cfg.petName) this.petName = cfg.petName;
    if (cfg.personality) this.personality = cfg.personality;
    if (cfg.tagStyle !== undefined) this.tagStyle = cfg.tagStyle;
    if (cfg.petStyle) this.petStyle = cfg.petStyle;
    if (cfg.petName) this.step = 3;
  }

  async save() {
    await this.spCtx.api.widget.save({
      ...this.spCtx.widgetInfo,
      config: { petType: this.petType, petName: this.petName, personality: this.personality, tagStyle: this.tagStyle, petStyle: this.petStyle }
    });
  }

  nextStep() {
    if (this.step === 1 && !this.petType) return;
    if (this.step === 2 && !this.petName.trim()) return;
    this.step++;
    if (this.step > 3) this.finish();
  }

  prevStep() { if (this.step > 1) this.step--; }

  async finish() {
    await this.save();
    this.spCtx.api.window.close();
  }

  render() {
    return html`
      <style>
        :host { display:block; width:100%; height:100%; }
        .wrap { padding:20px; font-family:system-ui; color:#333; height:100%; display:flex; flex-direction:column; justify-content:center; }
        h2 { margin:0 0 16px; font-size:18px; }
        .pets { display:flex; gap:12px; flex-wrap:wrap; }
        .pet-opt { width:80px; height:100px; border:2px solid #e5e7eb; border-radius:12px;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          cursor:pointer; transition:all .2s; }
        .pet-opt:hover { border-color:#a78bfa; }
        .pet-opt.sel { border-color:#7c3aed; background:#f5f3ff; }
        .pet-opt svg { width:50px; height:50px; }
        .pet-opt span { font-size:12px; margin-top:4px; }
        .personalities { display:flex; gap:8px; flex-wrap:wrap; }
        .pers { padding:8px 16px; border:2px solid #e5e7eb; border-radius:20px;
          cursor:pointer; font-size:13px; transition:all .2s; }
        .pers:hover { border-color:#a78bfa; }
        .pers.sel { border-color:#7c3aed; background:#f5f3ff; }
        .tags { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
        .tag-opt { padding:4px 12px; cursor:pointer; font-size:11px; font-weight:600; transition:all .2s; opacity:.7; }
        .tag-opt:hover { opacity:1; }
        .tag-opt.sel { opacity:1; box-shadow:0 0 0 2px #7c3aed; }
        .t0 { background:#fff9e6; color:#d97706; border-radius:3px 8px 8px 3px; border:1.5px solid #fbbf24; border-left:3px solid #f59e0b; }
        .t1 { background:#e0f2fe; color:#0284c7; border-radius:10px; border:1.5px solid #7dd3fc; }
        .t2 { background:#fce7f3; color:#db2777; border-radius:0 8px 0 8px; border:1.5px solid #f9a8d4; }
        .t3 { background:#ecfccb; color:#65a30d; border-radius:8px 0 8px 0; border:1.5px solid #bef264; }
        .styles { display:flex; gap:12px; margin-bottom:16px; }
        .style-opt { padding:8px 20px; border:2px solid #e5e7eb; border-radius:12px; cursor:pointer; font-size:13px; transition:all .2s; }
        .style-opt:hover { border-color:#a78bfa; }
        .style-opt.sel { border-color:#7c3aed; background:#f5f3ff; }
        input { width:100%; padding:12px; border:2px solid #e5e7eb; border-radius:8px;
          font-size:16px; outline:none; }
        input:focus { border-color:#7c3aed; }
        .btns { display:flex; gap:12px; margin-top:24px; }
        .btn { flex:1; padding:12px; border:none; border-radius:8px; font-size:14px;
          cursor:pointer; transition:all .2s; }
        .btn-pri { background:#7c3aed; color:#fff; }
        .btn-pri:hover { background:#6d28d9; }
        .btn-sec { background:#e5e7eb; }
        .preview { text-align:center; margin:20px 0; }
        .preview svg { width:120px; height:120px; }
        .preview h3 { margin:12px 0 4px; font-size:20px; }
        .preview p { color:#6b7280; font-size:13px; }
      </style>
      <div class="wrap">
        ${this.step === 1 ? this.renderStep1() : this.step === 2 ? this.renderStep2() : this.renderStep3()}
      </div>
    `;
  }

  renderStep1() {
    return html`
      <h2>选择风格</h2>
      <div class="styles">
        <div class="style-opt ${this.petStyle === 'cute' ? 'sel' : ''}" @click=${() => this.petStyle = 'cute'}>🎀 可爱风</div>
        <div class="style-opt ${this.petStyle === 'pixel' ? 'sel' : ''}" @click=${() => this.petStyle = 'pixel'}>👾 像素风</div>
      </div>
      <h2>选择宠物</h2>
      <div class="pets">
        ${Object.entries(PET_TYPES).map(([k, v]) => html`
          <div class="pet-opt ${this.petType === k ? 'sel' : ''}" @click=${() => this.petType = k}>
            <div .innerHTML=${generatePetSvg(k, 'idle', 0, this.petStyle)}></div>
            <span>${v.name}</span>
          </div>
        `)}
      </div>
      <div class="btns"><button class="btn btn-pri" @click=${() => this.nextStep()}>下一步</button></div>
    `;
  }

  renderStep2() {
    return html`
      <h2>给${PET_TYPES[this.petType]?.name || '宠物'}起个名字</h2>
      <input type="text" placeholder="输入名字..." .value=${this.petName}
        @input=${e => this.petName = e.target.value} maxlength="8">
      <h2 style="margin-top:16px">选择性格</h2>
      <div class="personalities">
        ${Object.entries(PERSONALITIES).map(([k, v]) => html`
          <div class="pers ${this.personality === k ? 'sel' : ''}" @click=${() => this.personality = k}>${v.name}</div>
        `)}
      </div>
      <h2 style="margin-top:16px">选择铭牌</h2>
      <div class="tags">
        ${[0,1,2,3].map(i => html`
          <span class="tag-opt t${i} ${this.tagStyle === i ? 'sel' : ''}" @click=${() => this.tagStyle = i}>示例名</span>
        `)}
      </div>
      <div class="btns">
        <button class="btn btn-sec" @click=${() => this.prevStep()}>上一步</button>
        <button class="btn btn-pri" @click=${() => this.nextStep()}>下一步</button>
      </div>
    `;
  }

  renderStep3() {
    const pers = PERSONALITIES[this.personality];
    return html`
      <div class="preview">
        <div .innerHTML=${generatePetSvg(this.petType, 'happy', 0, this.petStyle)}></div>
        <h3>${this.petName || '未命名'}</h3>
        <p>${PET_TYPES[this.petType]?.name} · ${pers?.name}</p>
        <p style="font-style:italic">"${pers?.greeting}"</p>
      </div>
      <div class="btns">
        <button class="btn btn-sec" @click=${() => this.prevStep()}>修改</button>
        <button class="btn btn-pri" @click=${() => this.finish()}>完成</button>
      </div>
    `;
  }
}
