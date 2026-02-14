var le = Object.defineProperty;
var de = (o, t, e) => t in o ? le(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var G = (o, t, e) => de(o, typeof t != "symbol" ? t + "" : t, e);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = globalThis, mt = X.ShadowRoot && (X.ShadyCSS === void 0 || X.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Jt = Symbol(), At = /* @__PURE__ */ new WeakMap();
let ce = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== Jt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (mt && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = At.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && At.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const vt = mt ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return ((s) => new ce(typeof s == "string" ? s : s + "", void 0, Jt))(e);
})(o) : o, { is: pe, defineProperty: ue, getOwnPropertyDescriptor: ge, getOwnPropertyNames: fe, getOwnPropertySymbols: $e, getPrototypeOf: me } = Object, y = globalThis, Ct = y.trustedTypes, _e = Ct ? Ct.emptyScript : "", nt = y.reactiveElementPolyfillSupport, L = (o, t) => o, ut = { toAttribute(o, t) {
  switch (t) {
    case Boolean:
      o = o ? _e : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, t) {
  let e = o;
  switch (t) {
    case Boolean:
      e = o !== null;
      break;
    case Number:
      e = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(o);
      } catch {
        e = null;
      }
  }
  return e;
} }, Zt = (o, t) => !pe(o, t), wt = { attribute: !0, type: String, converter: ut, reflect: !1, useDefault: !1, hasChanged: Zt };
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), y.litPropertyMetadata ?? (y.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let M = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = wt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && ue(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: n } = ge(this.prototype, t) ?? { get() {
      return this[e];
    }, set(r) {
      this[e] = r;
    } };
    return { get: i, set(r) {
      const h = i == null ? void 0 : i.call(this);
      n == null || n.call(this, r), this.requestUpdate(t, h, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? wt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(L("elementProperties"))) return;
    const t = me(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(L("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(L("properties"))) {
      const e = this.properties, s = [...fe(e), ...$e(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(vt(i));
    } else t !== void 0 && e.push(vt(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ((e, s) => {
      if (mt) e.adoptedStyleSheets = s.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
      else for (const i of s) {
        const n = document.createElement("style"), r = X.litNonce;
        r !== void 0 && n.setAttribute("nonce", r), n.textContent = i.cssText, e.appendChild(n);
      }
    })(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) == null ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    var n;
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : ut).toAttribute(e, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var n, r;
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const h = s.getPropertyOptions(i), a = typeof h.converter == "function" ? { fromAttribute: h.converter } : ((n = h.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? h.converter : ut;
      this._$Em = i;
      const d = a.fromAttribute(e, h.type);
      this[i] = d ?? ((r = this._$Ej) == null ? void 0 : r.get(i)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, n) {
    var r;
    if (t !== void 0) {
      const h = this.constructor;
      if (i === !1 && (n = this[t]), s ?? (s = h.getPropertyOptions(t)), !((s.hasChanged ?? Zt)(n, e) || s.useDefault && s.reflect && n === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(h._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: n }, r) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, r ?? e ?? this[t]), n !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, r] of this._$Ep) this[n] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, r] of i) {
        const { wrapped: h } = r, a = this[n];
        h !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, r, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((i) => {
        var n;
        return (n = i.hostUpdate) == null ? void 0 : n.call(i);
      }), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((s) => {
      var i;
      return (i = s.hostUpdated) == null ? void 0 : i.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
M.elementStyles = [], M.shadowRootOptions = { mode: "open" }, M[L("elementProperties")] = /* @__PURE__ */ new Map(), M[L("finalized")] = /* @__PURE__ */ new Map(), nt == null || nt({ ReactiveElement: M }), (y.reactiveElementVersions ?? (y.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = globalThis, Et = (o) => o, et = I.trustedTypes, St = et ? et.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, Kt = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, Yt = "?" + _, be = `<${Yt}>`, k = document, W = () => k.createComment(""), q = (o) => o === null || typeof o != "object" && typeof o != "function", gt = Array.isArray, rt = `[ 	
\f\r]`, z = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, kt = /-->/g, Pt = />/g, A = RegExp(`>|${rt}(?:([^\\s"'>=/]+)(${rt}*=${rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Mt = /'/g, Ot = /"/g, Gt = /^(?:script|style|textarea|title)$/i, _t = /* @__PURE__ */ ((o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }))(1), U = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), Ut = /* @__PURE__ */ new WeakMap(), C = k.createTreeWalker(k, 129);
function Xt(o, t) {
  if (!gt(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return St !== void 0 ? St.createHTML(t) : t;
}
const ye = (o, t) => {
  const e = o.length - 1, s = [];
  let i, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = z;
  for (let h = 0; h < e; h++) {
    const a = o[h];
    let d, c, l = -1, p = 0;
    for (; p < a.length && (r.lastIndex = p, c = r.exec(a), c !== null); ) p = r.lastIndex, r === z ? c[1] === "!--" ? r = kt : c[1] !== void 0 ? r = Pt : c[2] !== void 0 ? (Gt.test(c[2]) && (i = RegExp("</" + c[2], "g")), r = A) : c[3] !== void 0 && (r = A) : r === A ? c[0] === ">" ? (r = i ?? z, l = -1) : c[1] === void 0 ? l = -2 : (l = r.lastIndex - c[2].length, d = c[1], r = c[3] === void 0 ? A : c[3] === '"' ? Ot : Mt) : r === Ot || r === Mt ? r = A : r === kt || r === Pt ? r = z : (r = A, i = void 0);
    const f = r === A && o[h + 1].startsWith("/>") ? " " : "";
    n += r === z ? a + be : l >= 0 ? (s.push(d), a.slice(0, l) + Kt + a.slice(l) + _ + f) : a + _ + (l === -2 ? h : f);
  }
  return [Xt(o, n + (o[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class V {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let n = 0, r = 0;
    const h = t.length - 1, a = this.parts, [d, c] = ye(t, e);
    if (this.el = V.createElement(d, s), C.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (i = C.nextNode()) !== null && a.length < h; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const l of i.getAttributeNames()) if (l.endsWith(Kt)) {
          const p = c[r++], f = i.getAttribute(l).split(_), $ = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: n, name: $[2], strings: f, ctor: $[1] === "." ? Ae : $[1] === "?" ? ve : $[1] === "@" ? Ce : it }), i.removeAttribute(l);
        } else l.startsWith(_) && (a.push({ type: 6, index: n }), i.removeAttribute(l));
        if (Gt.test(i.tagName)) {
          const l = i.textContent.split(_), p = l.length - 1;
          if (p > 0) {
            i.textContent = et ? et.emptyScript : "";
            for (let f = 0; f < p; f++) i.append(l[f], W()), C.nextNode(), a.push({ type: 2, index: ++n });
            i.append(l[p], W());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Yt) a.push({ type: 2, index: n });
      else {
        let l = -1;
        for (; (l = i.data.indexOf(_, l + 1)) !== -1; ) a.push({ type: 7, index: n }), l += _.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = k.createElement("template");
    return s.innerHTML = t, s;
  }
}
function T(o, t, e = o, s) {
  var r, h;
  if (t === U) return t;
  let i = s !== void 0 ? (r = e._$Co) == null ? void 0 : r[s] : e._$Cl;
  const n = q(t) ? void 0 : t._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== n && ((h = i == null ? void 0 : i._$AO) == null || h.call(i, !1), n === void 0 ? i = void 0 : (i = new n(o), i._$AT(o, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = i : e._$Cl = i), i !== void 0 && (t = T(o, i._$AS(o, t.values), i, s)), t;
}
class xe {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, i = ((t == null ? void 0 : t.creationScope) ?? k).importNode(e, !0);
    C.currentNode = i;
    let n = C.nextNode(), r = 0, h = 0, a = s[0];
    for (; a !== void 0; ) {
      if (r === a.index) {
        let d;
        a.type === 2 ? d = new K(n, n.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (d = new we(n, this, t)), this._$AV.push(d), a = s[++h];
      }
      r !== (a == null ? void 0 : a.index) && (n = C.nextNode(), r++);
    }
    return C.currentNode = k, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class K {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = T(this, t, e), q(t) ? t === u || t == null || t === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : t !== this._$AH && t !== U && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ((s) => gt(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function")(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== u && q(this._$AH) ? this._$AA.nextSibling.data = t : this.T(k.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = V.createElement(Xt(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === i) this._$AH.p(e);
    else {
      const r = new xe(i, this), h = r.u(this.options);
      r.p(e), this.T(h), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = Ut.get(t.strings);
    return e === void 0 && Ut.set(t.strings, e = new V(t)), e;
  }
  k(t) {
    gt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const n of t) i === e.length ? e.push(s = new K(this.O(W()), this.O(W()), this, this.options)) : s = e[i], s._$AI(n), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e); t !== this._$AB; ) {
      const i = Et(t).nextSibling;
      Et(t).remove(), t = i;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class it {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, n) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = u;
  }
  _$AI(t, e = this, s, i) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) t = T(this, t, e, 0), r = !q(t) || t !== this._$AH && t !== U, r && (this._$AH = t);
    else {
      const h = t;
      let a, d;
      for (t = n[0], a = 0; a < n.length - 1; a++) d = T(this, h[s + a], e, a), d === U && (d = this._$AH[a]), r || (r = !q(d) || d !== this._$AH[a]), d === u ? t = u : t !== u && (t += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    r && !i && this.j(t);
  }
  j(t) {
    t === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ae extends it {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === u ? void 0 : t;
  }
}
class ve extends it {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== u);
  }
}
class Ce extends it {
  constructor(t, e, s, i, n) {
    super(t, e, s, i, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = T(this, t, e, 0) ?? u) === U) return;
    const s = this._$AH, i = t === u && s !== u || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== u && (s === u || i);
    i && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class we {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    T(this, t);
  }
}
const at = I.litHtmlPolyfillSupport;
at == null || at(V, K), (I.litHtmlVersions ?? (I.litHtmlVersions = [])).push("3.3.2");
const E = globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class D extends M {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ((s, i, n) => {
      const r = (n == null ? void 0 : n.renderBefore) ?? i;
      let h = r._$litPart$;
      if (h === void 0) {
        const a = (n == null ? void 0 : n.renderBefore) ?? null;
        r._$litPart$ = h = new K(i.insertBefore(W(), a), a, void 0, n ?? {});
      }
      return h._$AI(s), h;
    })(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return U;
  }
}
var Vt;
D._$litElement$ = !0, D.finalized = !0, (Vt = E.litElementHydrateSupport) == null || Vt.call(E, { LitElement: D });
const ht = E.litElementPolyfillSupport;
ht == null || ht({ LitElement: D }), (E.litElementVersions ?? (E.litElementVersions = [])).push("4.2.2");
class Qt extends D {
  constructor() {
    super(), this._initialized = !1, this._eventListeners = /* @__PURE__ */ new Map();
  }
  initializeMicroApp() {
    this._initialized || (this._setupEventListeners(), this._initialized = !0);
  }
  connectedCallback() {
    super.connectedCallback(), this.initializeMicroApp(), this.onConnected();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._cleanupEventListeners(), this.onDisconnected();
  }
  attributeChangedCallback(t, e, s) {
    super.attributeChangedCallback(t, e, s), this.onAttributeChanged(t, e, s);
  }
  _setupEventListeners() {
  }
  _cleanupEventListeners() {
    const t = Array.from(this._eventListeners.entries());
    for (const [e, s] of t) s.forEach((i) => {
      window.removeEventListener(e, i);
    });
    this._eventListeners.clear();
  }
  addEventListener(t, e, s) {
    super.addEventListener(t, e, s);
  }
  dispatchCustomEvent(t, e) {
    const s = new CustomEvent(t, { bubbles: !0, composed: !0, detail: e });
    this.dispatchEvent(s);
  }
  onConnected() {
  }
  onDisconnected() {
  }
  onAttributeChanged(t, e, s) {
  }
  render() {
    return _t``;
  }
}
class te extends Qt {
  constructor() {
    super(), this.spCtx = { api: {}, darkMode: !1, language: "zh-CN", networkMode: "wan", staticPath: "", role: 0, widgetInfo: {} };
  }
  updateContext(t) {
    if (!t || typeof t != "object") return;
    const e = Object.fromEntries(Object.entries(t).filter(([s, i]) => i !== void 0));
    this.spCtx = { ...this.spCtx, ...e };
  }
  firstUpdated(t) {
    var e;
    (e = super.firstUpdated) == null || e.call(this, t), this.onFirstRendered();
  }
  updated(t) {
    if (super.updated(t), t.has("spCtx")) {
      const e = t.get("spCtx") || {}, s = this.spCtx;
      s.widgetInfo !== e.widgetInfo && this.onWidgetInfoChanged(s.widgetInfo, e.widgetInfo), s.darkMode !== e.darkMode && this.onDarkModeChanged(s.darkMode, e.darkMode), s.language !== e.language && this.onLanguageChanged(s.language, e.language), s.networkMode !== e.networkMode && this.onNetworkModeChanged(s.networkMode, e.networkMode);
    }
  }
  onConnected() {
    super.onConnected(), this.onInitialized();
  }
  onInitialized() {
  }
  onFirstRendered() {
  }
  onDarkModeChanged(t, e) {
  }
  onLanguageChanged(t, e) {
  }
  onNetworkModeChanged(t, e) {
  }
  onWidgetInfoChanged(t, e) {
  }
  render() {
    return _t``;
  }
}
te.properties = { spCtx: { type: Object, attribute: !1 } };
class ee extends Qt {
  constructor() {
    super(), this.spCtx = { api: {}, darkMode: !1, language: "zh-CN", networkMode: "wan", staticPath: "", role: 0, background: "", widgetInfo: {}, customParam: {} };
  }
  updateContext(t) {
    if (!t || typeof t != "object") return;
    const e = Object.fromEntries(Object.entries(t).filter(([s, i]) => i !== void 0));
    this.spCtx = { ...this.spCtx, ...e };
  }
  firstUpdated(t) {
    var e;
    (e = super.firstUpdated) == null || e.call(this, t), this.onFirstRendered();
  }
  updated(t) {
    if (super.updated(t), t.has("spCtx")) {
      const e = t.get("spCtx") || {}, s = this.spCtx;
      s.darkMode !== e.darkMode && this.onDarkModeChanged(s.darkMode, e.darkMode), s.language !== e.language && this.onLanguageChanged(s.language, e.language), s.networkMode !== e.networkMode && this.onNetworkModeChanged(s.networkMode, e.networkMode);
    }
  }
  onConnected() {
    super.onConnected(), this.onInitialized({ widgetInfo: this.spCtx.widgetInfo, customParam: this.spCtx.customParam });
  }
  onInitialized(t) {
  }
  onFirstRendered() {
  }
  onDarkModeChanged(t, e) {
  }
  onLanguageChanged(t, e) {
  }
  onNetworkModeChanged(t, e) {
  }
  render() {
    return _t``;
  }
}
ee.properties = { spCtx: { type: Object, attribute: !1 } };
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Q = globalThis, bt = Q.ShadowRoot && (Q.ShadyCSS === void 0 || Q.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, yt = Symbol(), Tt = /* @__PURE__ */ new WeakMap();
let se = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== yt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (bt && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Tt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Tt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ee = (o) => new se(typeof o == "string" ? o : o + "", void 0, yt), Se = (o, ...t) => {
  const e = o.length === 1 ? o[0] : t.reduce((s, i, n) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + o[n + 1], o[0]);
  return new se(e, o, yt);
}, ke = (o, t) => {
  if (bt) o.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = Q.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, o.appendChild(s);
  }
}, Nt = bt ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Ee(e);
})(o) : o;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Pe, defineProperty: Me, getOwnPropertyDescriptor: Oe, getOwnPropertyNames: Ue, getOwnPropertySymbols: Te, getPrototypeOf: Ne } = Object, x = globalThis, Ht = x.trustedTypes, He = Ht ? Ht.emptyScript : "", lt = x.reactiveElementPolyfillSupport, j = (o, t) => o, ft = { toAttribute(o, t) {
  switch (t) {
    case Boolean:
      o = o ? He : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, t) {
  let e = o;
  switch (t) {
    case Boolean:
      e = o !== null;
      break;
    case Number:
      e = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(o);
      } catch {
        e = null;
      }
  }
  return e;
} }, ie = (o, t) => !Pe(o, t), zt = { attribute: !0, type: String, converter: ft, reflect: !1, useDefault: !1, hasChanged: ie };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), x.litPropertyMetadata ?? (x.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let O = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = zt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Me(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: n } = Oe(this.prototype, t) ?? { get() {
      return this[e];
    }, set(r) {
      this[e] = r;
    } };
    return { get: i, set(r) {
      const h = i == null ? void 0 : i.call(this);
      n == null || n.call(this, r), this.requestUpdate(t, h, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? zt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(j("elementProperties"))) return;
    const t = Ne(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(j("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(j("properties"))) {
      const e = this.properties, s = [...Ue(e), ...Te(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(Nt(i));
    } else t !== void 0 && e.push(Nt(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ke(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostConnected) == null ? void 0 : s.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var s;
      return (s = e.hostDisconnected) == null ? void 0 : s.call(e);
    });
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    var n;
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : ft).toAttribute(e, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var n, r;
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const h = s.getPropertyOptions(i), a = typeof h.converter == "function" ? { fromAttribute: h.converter } : ((n = h.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? h.converter : ft;
      this._$Em = i;
      const d = a.fromAttribute(e, h.type);
      this[i] = d ?? ((r = this._$Ej) == null ? void 0 : r.get(i)) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, n) {
    var r;
    if (t !== void 0) {
      const h = this.constructor;
      if (i === !1 && (n = this[t]), s ?? (s = h.getPropertyOptions(t)), !((s.hasChanged ?? ie)(n, e) || s.useDefault && s.reflect && n === ((r = this._$Ej) == null ? void 0 : r.get(t)) && !this.hasAttribute(h._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: n }, r) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, r ?? e ?? this[t]), n !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, r] of this._$Ep) this[n] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, r] of i) {
        const { wrapped: h } = r, a = this[n];
        h !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, r, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (s = this._$EO) == null || s.forEach((i) => {
        var n;
        return (n = i.hostUpdate) == null ? void 0 : n.call(i);
      }), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((s) => {
      var i;
      return (i = s.hostUpdated) == null ? void 0 : i.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
O.elementStyles = [], O.shadowRootOptions = { mode: "open" }, O[j("elementProperties")] = /* @__PURE__ */ new Map(), O[j("finalized")] = /* @__PURE__ */ new Map(), lt == null || lt({ ReactiveElement: O }), (x.reactiveElementVersions ?? (x.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const B = globalThis, Rt = (o) => o, st = B.trustedTypes, Lt = st ? st.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, oe = "$lit$", b = `lit$${Math.random().toFixed(9).slice(2)}$`, ne = "?" + b, ze = `<${ne}>`, P = document, F = () => P.createComment(""), J = (o) => o === null || typeof o != "object" && typeof o != "function", xt = Array.isArray, Re = (o) => xt(o) || typeof (o == null ? void 0 : o[Symbol.iterator]) == "function", dt = `[ 	
\f\r]`, R = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, It = /-->/g, Dt = />/g, v = RegExp(`>|${dt}(?:([^\\s"'>=/]+)(${dt}*=${dt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), jt = /'/g, Bt = /"/g, re = /^(?:script|style|textarea|title)$/i, Le = (o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }), m = Le(1), N = Symbol.for("lit-noChange"), g = Symbol.for("lit-nothing"), Wt = /* @__PURE__ */ new WeakMap(), w = P.createTreeWalker(P, 129);
function ae(o, t) {
  if (!xt(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Lt !== void 0 ? Lt.createHTML(t) : t;
}
const Ie = (o, t) => {
  const e = o.length - 1, s = [];
  let i, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = R;
  for (let h = 0; h < e; h++) {
    const a = o[h];
    let d, c, l = -1, p = 0;
    for (; p < a.length && (r.lastIndex = p, c = r.exec(a), c !== null); ) p = r.lastIndex, r === R ? c[1] === "!--" ? r = It : c[1] !== void 0 ? r = Dt : c[2] !== void 0 ? (re.test(c[2]) && (i = RegExp("</" + c[2], "g")), r = v) : c[3] !== void 0 && (r = v) : r === v ? c[0] === ">" ? (r = i ?? R, l = -1) : c[1] === void 0 ? l = -2 : (l = r.lastIndex - c[2].length, d = c[1], r = c[3] === void 0 ? v : c[3] === '"' ? Bt : jt) : r === Bt || r === jt ? r = v : r === It || r === Dt ? r = R : (r = v, i = void 0);
    const f = r === v && o[h + 1].startsWith("/>") ? " " : "";
    n += r === R ? a + ze : l >= 0 ? (s.push(d), a.slice(0, l) + oe + a.slice(l) + b + f) : a + b + (l === -2 ? h : f);
  }
  return [ae(o, n + (o[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class Z {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let n = 0, r = 0;
    const h = t.length - 1, a = this.parts, [d, c] = Ie(t, e);
    if (this.el = Z.createElement(d, s), w.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (i = w.nextNode()) !== null && a.length < h; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const l of i.getAttributeNames()) if (l.endsWith(oe)) {
          const p = c[r++], f = i.getAttribute(l).split(b), $ = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: n, name: $[2], strings: f, ctor: $[1] === "." ? je : $[1] === "?" ? Be : $[1] === "@" ? We : ot }), i.removeAttribute(l);
        } else l.startsWith(b) && (a.push({ type: 6, index: n }), i.removeAttribute(l));
        if (re.test(i.tagName)) {
          const l = i.textContent.split(b), p = l.length - 1;
          if (p > 0) {
            i.textContent = st ? st.emptyScript : "";
            for (let f = 0; f < p; f++) i.append(l[f], F()), w.nextNode(), a.push({ type: 2, index: ++n });
            i.append(l[p], F());
          }
        }
      } else if (i.nodeType === 8) if (i.data === ne) a.push({ type: 2, index: n });
      else {
        let l = -1;
        for (; (l = i.data.indexOf(b, l + 1)) !== -1; ) a.push({ type: 7, index: n }), l += b.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = P.createElement("template");
    return s.innerHTML = t, s;
  }
}
function H(o, t, e = o, s) {
  var r, h;
  if (t === N) return t;
  let i = s !== void 0 ? (r = e._$Co) == null ? void 0 : r[s] : e._$Cl;
  const n = J(t) ? void 0 : t._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== n && ((h = i == null ? void 0 : i._$AO) == null || h.call(i, !1), n === void 0 ? i = void 0 : (i = new n(o), i._$AT(o, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = i : e._$Cl = i), i !== void 0 && (t = H(o, i._$AS(o, t.values), i, s)), t;
}
class De {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, i = ((t == null ? void 0 : t.creationScope) ?? P).importNode(e, !0);
    w.currentNode = i;
    let n = w.nextNode(), r = 0, h = 0, a = s[0];
    for (; a !== void 0; ) {
      if (r === a.index) {
        let d;
        a.type === 2 ? d = new Y(n, n.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (d = new qe(n, this, t)), this._$AV.push(d), a = s[++h];
      }
      r !== (a == null ? void 0 : a.index) && (n = w.nextNode(), r++);
    }
    return w.currentNode = P, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class Y {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = g, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = H(this, t, e), J(t) ? t === g || t == null || t === "" ? (this._$AH !== g && this._$AR(), this._$AH = g) : t !== this._$AH && t !== N && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Re(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== g && J(this._$AH) ? this._$AA.nextSibling.data = t : this.T(P.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var n;
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = Z.createElement(ae(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === i) this._$AH.p(e);
    else {
      const r = new De(i, this), h = r.u(this.options);
      r.p(e), this.T(h), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = Wt.get(t.strings);
    return e === void 0 && Wt.set(t.strings, e = new Z(t)), e;
  }
  k(t) {
    xt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const n of t) i === e.length ? e.push(s = new Y(this.O(F()), this.O(F()), this, this.options)) : s = e[i], s._$AI(n), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e); t !== this._$AB; ) {
      const i = Rt(t).nextSibling;
      Rt(t).remove(), t = i;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class ot {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, n) {
    this.type = 1, this._$AH = g, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = g;
  }
  _$AI(t, e = this, s, i) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) t = H(this, t, e, 0), r = !J(t) || t !== this._$AH && t !== N, r && (this._$AH = t);
    else {
      const h = t;
      let a, d;
      for (t = n[0], a = 0; a < n.length - 1; a++) d = H(this, h[s + a], e, a), d === N && (d = this._$AH[a]), r || (r = !J(d) || d !== this._$AH[a]), d === g ? t = g : t !== g && (t += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    r && !i && this.j(t);
  }
  j(t) {
    t === g ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class je extends ot {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === g ? void 0 : t;
  }
}
class Be extends ot {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== g);
  }
}
class We extends ot {
  constructor(t, e, s, i, n) {
    super(t, e, s, i, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = H(this, t, e, 0) ?? g) === N) return;
    const s = this._$AH, i = t === g && s !== g || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== g && (s === g || i);
    i && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class qe {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    H(this, t);
  }
}
const ct = B.litHtmlPolyfillSupport;
ct == null || ct(Z, Y), (B.litHtmlVersions ?? (B.litHtmlVersions = [])).push("3.3.2");
const Ve = (o, t, e) => {
  const s = (e == null ? void 0 : e.renderBefore) ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const n = (e == null ? void 0 : e.renderBefore) ?? null;
    s._$litPart$ = i = new Y(t.insertBefore(F(), n), n, void 0, e ?? {});
  }
  return i._$AI(o), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S = globalThis;
class tt extends O {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ve(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return N;
  }
}
var Ft;
tt._$litElement$ = !0, tt.finalized = !0, (Ft = S.litElementHydrateSupport) == null || Ft.call(S, { LitElement: tt });
const pt = S.litElementPolyfillSupport;
pt == null || pt({ LitElement: tt });
(S.litElementVersions ?? (S.litElementVersions = [])).push("4.2.2");
function Fe(o, t) {
  const e = o.startsWith("/") ? o.slice(1) : o;
  return `${t.endsWith("/") ? t : `${t}/`}${e}`;
}
class $t extends te {
  /**
   * 组件初始化完成后调用
   * @returns {void}
   */
  onInitialized() {
    this.name = "World", this.handleChangeName();
  }
  /**
   * customText 配置变化时的回调函数
   * @param {string} newValue - 新值
   * @param {string} oldValue - 旧值
   */
  handleCustomTextChanged(t, e) {
    var s, i, n;
    console.log("[Widget] customText 配置变化:", { oldValue: e, newValue: t }), ((n = (i = (s = this.spCtx) == null ? void 0 : s.widgetInfo) == null ? void 0 : i.config) == null ? void 0 : n.textOption) === "custom" && (this.name = t || "World");
  }
  getAssetPath(t) {
    return console.log("[getAssetPath] Called with:", { relativePath: t, staticPath: this.spCtx.staticPath }), Fe(t, this.spCtx.staticPath);
  }
  handleChangeName() {
    var t, e, s, i;
    if (((s = (e = (t = this.spCtx) == null ? void 0 : t.widgetInfo) == null ? void 0 : e.config) == null ? void 0 : s.textOption) === "custom") {
      this.name = (i = this.spCtx.widgetInfo.config) == null ? void 0 : i.customText;
      return;
    }
    this.name = this.name === "World" ? "Sun-Panel" : "World";
  }
  /**
   * 小部件信息变化时的回调函数
   * @param {WidgetInfo} newWidgetInfo - 新的小部件信息
   * @param {WidgetInfo} oldWidgetInfo - 旧的小部件信息
   */
  onWidgetInfoChanged(t, e) {
    var s, i;
    console.log("[Widget] 小部件信息变化:", { newWidgetInfo: t, oldWidgetInfo: e }), ((s = t == null ? void 0 : t.config) == null ? void 0 : s.textOption) === "custom" ? this.name = (i = this.spCtx.widgetInfo.config) == null ? void 0 : i.customText : this.name = "World", this.requestUpdate();
  }
  // ===================
  // 各个尺寸的局部渲染方法
  // ===================
  render1x1() {
    return m`
        <div class="greeting" style="font-size: 20px;margin: 5px;">
          Hello !
        </div>
    `;
  }
  render1x2() {
    return m`
        <div class="greeting" style="font-size: 20px;">
          Hello, <span class="name" @click=${this.handleChangeName}>${this.name} </span> !
        </div>
    `;
  }
  render2x1() {
    return m`
        <div class="greeting" style="margin: 5px;font-size: 20px;">
          Hello, <span class="name" @click=${this.handleChangeName}>${this.name} </span> !
        </div>
    `;
  }
  render2x2() {
    return m`
         <div class="greeting" style="font-size: 20px;">Hello, <span class="name" @click=${this.handleChangeName}>${this.name} </span> !</div>
    `;
  }
  render2x4() {
    return m`
        <div class="greeting" style="font-size: 30px;">Hello, <span class="name" @click=${this.handleChangeName}>${this.name} </span> !</div>
    `;
  }
  render1xfull() {
    return this.render2x4();
  }
  render() {
    var e, s, i;
    const t = ((i = (s = (e = this.spCtx) == null ? void 0 : e.widgetInfo) == null ? void 0 : s.config) == null ? void 0 : i.showLogo) ?? !0;
    return m`
      <div class="container" style="background: ${this.spCtx.widgetInfo.config.useSystemBgColor ? "transparent" : this.spCtx && this.spCtx.darkMode ? "#181818" : "white"}">
        ${t ? m`
        <div class="background-image">
           <img src=${this.getAssetPath("/sun-panel-logo.png")} />
        </div>` : ""}
        ${this.spCtx.widgetInfo.gridSize === "1x1" ? this.render1x1() : ""}
        ${this.spCtx.widgetInfo.gridSize === "1x2" ? this.render1x2() : ""}
        ${this.spCtx.widgetInfo.gridSize === "2x1" ? this.render2x1() : ""}
        ${this.spCtx.widgetInfo.gridSize === "2x2" ? this.render2x2() : ""}
        ${this.spCtx.widgetInfo.gridSize === "2x4" ? this.render2x4() : ""}
        ${this.spCtx.widgetInfo.gridSize === "1xfull" ? this.render1xfull() : ""}
      </div>
    `;
  }
}
G($t, "properties", {
  name: { type: String }
}), // 定义样式
G($t, "styles", Se`
    .greeting {
      font-weight: bold; 
      color: #1890ff;
      z-index: 1;
    }
    
    .container {
      font-family: Arial, sans-serif; 
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .background-image {
      position: absolute;
      height: 60%; /* 保持宽高比 */
      right: 10px;
      top: 10px;
      pointer-events: none;
      /* z-index: -1; */
      transform: rotate(-15deg); /* 添加旋转角度 */
      opacity: 0.5; /* 添加透明度设置 */
      filter: blur(5px); /* 添加模糊效果 */
    }
    
    .background-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .name {
      cursor: pointer;
      font-weight: bold; 
      background: linear-gradient(45deg, #1890ff, #00c4ff, #00ff87);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 20px 0;
    }
  `);
class he extends ee {
  /**
   * 页面初始化时调用
   */
  onInitialized({ widgetInfo: t, customParam: e }) {
    console.log("[CardConfig] Initialized", t, e), this.widgetInfo = t;
    const s = (t == null ? void 0 : t.config) || {};
    this.showLogo = s.showLogo ?? !0, this.textOption = s.textOption ?? "toggle", this.customText = s.customText || "", this.useSystemBgColor = s.useSystemBgColor ?? !0, console.log("获取到传来的小部件配置数据", t), this.requestUpdate();
  }
  /**
   * 加载配置
   */
  async loadConfig() {
    try {
      const t = await this.spCtx.api.dataNode.user.get("cardConfig");
      t && (this.config = { ...this.config, ...t }), this.requestUpdate();
    } catch (t) {
      console.error("[CardConfig] Failed to load config:", t);
    }
  }
  async handleSaveOrCreateWidget() {
    console.log("保存或创建小部件", this.widgetInfo), this.spCtx.api.widget.save({
      ...this.widgetInfo,
      config: {
        ...this.widgetInfo.config,
        showLogo: this.showLogo,
        textOption: this.textOption,
        customText: this.customText,
        useSystemBgColor: this.useSystemBgColor
      }
    });
  }
  getButtonTitle() {
    var t;
    return ((t = this.widgetInfo) == null ? void 0 : t.id) !== 0 ? "保存小部件" : "创建小部件";
  }
  getTitle() {
    var t;
    return ((t = this.widgetInfo) == null ? void 0 : t.id) !== 0 ? "编辑小部件" : "添加小部件";
  }
  handleTextOptionChange(t) {
    this.textOption = t.target.value;
  }
  render() {
    var e;
    const t = ((e = this.spCtx) == null ? void 0 : e.darkMode) ?? !1;
    return m`
      <style>
        :host { height: 100%; width: 100%; display: block; }
        
        .container {
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          color: ${t ? "#e5e5e5" : "#262626"};
          display: flex;
          flex-direction: column;
        }
        
        .content-wrapper {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
        }
        
        .content-wrapper::-webkit-scrollbar { width: 6px; }
        .content-wrapper::-webkit-scrollbar-track { background: transparent; }
        .content-wrapper::-webkit-scrollbar-thumb {
          background: ${t ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"};
          border-radius: 3px;
        }
        .content-wrapper::-webkit-scrollbar-thumb:hover {
          background: ${t ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"};
        }
        
        h1 { color: #1890ff; margin: 0 0 4px; font-size: 18px; font-weight: 600; }
        .subtitle { color: #8c8c8c; margin-bottom: 16px; font-size: 12px; }
        
        .form-section {
          background: ${t ? "rgba(38,38,38,0.7)" : "rgba(250,250,250,0.7)"};
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
          border: 1px solid ${t ? "rgba(48,48,48,0.8)" : "rgba(232,232,232,0.8)"};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: ${t ? "#e5e5e5" : "#262626"};
          display: flex;
          align-items: center;
        }
        
        .section-title::before {
          content: '';
          width: 3px;
          height: 14px;
          background: #1890ff;
          margin-right: 6px;
          border-radius: 2px;
        }
        
        .form-group { margin: 12px 0; }
        .form-group:first-child { margin-top: 0; }
        .form-group:last-child { margin-bottom: 0; }
        
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 13px;
          color: ${t ? "#d9d9d9" : "#595959"};
        }
        
        .checkbox-label, .radio-option {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 8px 12px;
          background: ${t ? "#1a1a1a" : "#fff"};
          border-radius: 4px;
          border: 1px solid ${t ? "#303030" : "#d9d9d9"};
          transition: all 0.2s ease;
          margin-bottom: 6px;
        }
        
        .checkbox-label:hover, .radio-option:hover {
          border-color: #1890ff;
          background: ${t ? "#262626" : "#f0f7ff"};
        }
        
        .checkbox-label input, .radio-option input {
          margin-right: 8px;
          width: 16px;
          height: 16px;
          accent-color: #1890ff;
        }
        
        .radio-group { display: flex; flex-direction: column; }
        .radio-option { margin-bottom: 0; border-radius: 0; }
        .radio-option:first-child { border-radius: 4px 4px 0 0; }
        .radio-option:last-child { border-radius: 0 0 4px 4px; }
        .radio-group .radio-option + .radio-option { border-top: none; }
        
        input.styled-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid ${t ? "#303030" : "#d9d9d9"};
          border-radius: 4px;
          font-size: 13px;
          color: ${t ? "#e5e5e5" : "#262626"};
          background: ${t ? "#1a1a1a" : "#fff"};
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        
        input.styled-input:focus {
          outline: none;
          border-color: #1890ff;
          box-shadow: 0 0 0 3px rgba(24,144,255,0.1);
        }
        
        .debug-info {
          background: ${t ? "#1a1a1a" : "#f5f5f5"};
          border: 1px dashed ${t ? "#303030" : "#d9d9d9"};
          border-radius: 4px;
          padding: 10px;
          margin: 12px 0;
          font-family: monospace;
          font-size: 11px;
          color: #8c8c8c;
          word-break: break-all;
          max-height: 150px;
          overflow-y: auto;
        }
        
        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid ${t ? "#303030" : "#e8e8e8"};
          flex-shrink: 0;
        }
        
        button[type="button"] {
          padding: 8px 24px;
          background: #1890ff;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(24,144,255,0.15);
        }
        
        button[type="button"]:hover {
          background: #40a9ff;
          box-shadow: 0 4px 8px rgba(24,144,255,0.25);
          transform: translateY(-1px);
        }
        
        button[type="button"]:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(24,144,255,0.15);
        }
      </style>
      <div class="container">
        <div class="content-wrapper">
          <h1>${this.getTitle()}</h1>
          <p class="subtitle">配置小部件的显示内容和样式选项</p>
          
          <form @submit="${(s) => s.preventDefault()}">
            <!-- 背景设置 -->
            <div class="form-section">
              <div class="section-title">外观设置</div>
              <div class="form-group">
                <label>卡片背景</label>
                <label class="checkbox-label">
                  <input type="checkbox" id="useSystemBgColor" name="useSystemBgColor" .checked="${this.useSystemBgColor}" @change="${(s) => this.useSystemBgColor = s.target.checked}">
                  使用系统背景色
                </label>
              </div>
              
              <div class="form-group">
                <label>Logo 显示</label>
                <label class="checkbox-label">
                  <input type="checkbox" id="showLogo" name="showLogo" .checked="${this.showLogo}" @change="${(s) => this.showLogo = s.target.checked}">
                  显示 Logo
                </label>
              </div>
            </div>
            
            <!-- 文字内容配置 -->
            <div class="form-section">
              <div class="section-title">文字内容</div>
              <div class="form-group">
                <label>显示模式</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input type="radio" name="textOption" value="toggle" .checked="${this.textOption === "toggle"}" @change="${this.handleTextOptionChange}">
                    点击切换（World / Sun-Panel）
                  </label>
                  <label class="radio-option">
                    <input type="radio" name="textOption" value="custom" .checked="${this.textOption === "custom"}" @change="${this.handleTextOptionChange}">
                    自定义文字
                  </label>
                </div>
              </div>
              
              ${this.textOption === "custom" ? m`
                <div class="form-group">
                  <label for="customText">自定义文字</label>
                  <input
                    type="text"
                    id="customText"
                    name="customText"
                    .value="${this.customText}"
                    @input="${(s) => this.customText = s.target.value}"
                    placeholder="请输入要显示的文字"
                    class="styled-input"
                  >
                </div>
              ` : ""}
            </div>
            
            <!-- 调试信息 -->
            <div class="debug-info">
              <strong>小部件配置数据：</strong>${JSON.stringify(this.widgetInfo, null, 2)}
            </div>
          </form>
        </div>
        
        <div class="button-container">
          <button type="button" @click=${this.handleSaveOrCreateWidget}>${this.getButtonTitle()}</button>
        </div>
      </div>
    `;
  }
}
G(he, "properties", {
  widgetInfo: { type: Object },
  showLogo: { type: Boolean },
  textOption: { type: String },
  customText: { type: String },
  useSystemBgColor: { type: Boolean }
});
const Je = {
  // =======================
  // 页面注册
  // =======================
  pages: {
    "hello-world-config": {
      // 组件对象（直接引用）
      component: he,
      // 背景颜色 支持css样式，为空底色默认为白色
      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      // 头部文字颜色
      headerTextColor: "#1890ff"
    }
  },
  // =======================
  // 小部件（卡片）注册
  // =======================
  widgets: {
    "hello-world-widget": {
      // 组件对象（直接引用）widgetId
      component: $t,
      // 绑定的小部件配置 Page 组件名字
      // 当主平台添加当前应用的小部件时会以窗口的形式打开此组件页面进行配置
      configComponentName: "hello-world-config",
      // 卡片尺寸: 1x1 1x2 1xfull 2x1 2x2 2x4
      size: ["1x1", "1x2", "1xfull", "2x1", "2x2", "2x4"],
      // 为空使用Sun-Panel默认背景颜色作为底色 支持css样式
      background: ""
    }
  }
}, qt = {
  // =======================
  // 应用基础信息
  // =======================
  // 作者标识
  author: "hslr",
  // 应用唯一标识（作者标识-应用标识）
  microAppId: "hslr-hello-world",
  // 应用版本
  version: "1.0.0",
  // 入口文件
  entry: "main.js",
  // 图标
  icon: "logo.png",
  // 应用信息 国际化配置
  appInfo: {
    "zh-CN": {
      appName: "Hello World",
      description: "Sun-Panel 演示微应用",
      networkDescription: "无需链接任何三方网站"
    },
    "en-US": {
      appName: "Hello World",
      description: "Micro App Hello World",
      networkDescription: "For demonstration purposes"
    }
  },
  // 权限配置
  permissions: [
    // 'network',
    // 'dataNode'
  ],
  // 网络域名白名单
  networkDomains: [],
  // 数据节点配置
  dataNodes: {}
}, Ze = !1, Ke = (o, t) => o.microAppId, es = {
  // 应用配置（整体赋值 appConfig 对象）
  appConfig: {
    ...qt,
    // dev 模式下自动添加 -dev 后缀
    microAppId: Ke(qt),
    dev: Ze
  },
  // 组件配置（对象形式，key为组件名）
  components: Je
};
export {
  es as default
};
