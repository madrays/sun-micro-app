// 像素宠物 SVG 生成器 - 支持可爱风和像素风
const COLORS = {
  cat: { main: '#ff9f43', light: '#ffd699', dark: '#e89b3a', white: '#fff8f0', pink: '#ffb6c1', eye: '#2d5016', nose: '#ff8fab', blush: '#ffc0cb' },
  dog: { main: '#c4a574', light: '#e8d4b8', dark: '#a08050', white: '#fff8f0', pink: '#ffb6c1', eye: '#3d2914', nose: '#3d3d3d', blush: '#ffc0cb' },
  bunny: { main: '#fafafa', light: '#ffffff', dark: '#e0e0e0', white: '#fff8f0', pink: '#ffb6c1', eye: '#3d2914', nose: '#ffb6c1', blush: '#ffc0cb' },
  bird: { main: '#7ec8e3', light: '#a8dff0', dark: '#5eb3d0', white: '#fff8f0', pink: '#ffb6c1', eye: '#3d2914', nose: '#ffb347', blush: '#ffc0cb' },
  panda: { main: '#ffffff', light: '#f8f8f8', dark: '#2d2d2d', white: '#ffffff', pink: '#ffb6c1', eye: '#ffffff', nose: '#2d2d2d', blush: '#ffc0cb' },
  hamster: { main: '#f5d4a8', light: '#fae8d0', dark: '#e8c090', white: '#fff8f0', pink: '#ffb6c1', eye: '#3d2914', nose: '#ffb6c1', blush: '#ffc0cb' }
};

const e = (cx, cy, rx, ry, c) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const P = 2;
const px = (x, y, c) => `<rect x="${x*P}" y="${y*P}" width="${P}" height="${P}" fill="${c}"/>`;

function drawCat(c, state, frame) {
  const f4 = frame % 4, f8 = frame % 8, f12 = frame % 12;
  const by = f8 < 4 ? 0 : 1;
  const earY = f4 < 2 ? 0 : -1;
  const blink = f12 < 2;
  const smile = f8 < 2;
  let s = '';
  // 尖耳朵
  s += `<path d="M14 ${20+earY} L20 8 L26 ${20+earY} Z" fill="${c.main}"/>`;
  s += `<path d="M38 ${20+earY} L44 8 L50 ${20+earY} Z" fill="${c.main}"/>`;
  s += `<path d="M17 ${18+earY} L20 10 L23 ${18+earY} Z" fill="${c.pink}"/>`;
  s += `<path d="M41 ${18+earY} L44 10 L47 ${18+earY} Z" fill="${c.pink}"/>`;
  // 头
  s += e(32, 30+by, 18, 14, c.main);
  // 眼睛
  if (state === 'sleep') {
    s += `<path d="M24 ${28+by} L30 ${28+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${28+by} L40 ${28+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if ((state === 'happy' || state === 'eat') && smile) {
    s += `<path d="M24 ${30+by} Q27 ${26+by} 30 ${30+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${30+by} Q37 ${26+by} 40 ${30+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if (blink) {
    s += `<path d="M24 ${28+by} L30 ${28+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${28+by} L40 ${28+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else {
    s += e(27, 28+by, 4, 5, '#90EE90');
    s += e(37, 28+by, 4, 5, '#90EE90');
    s += `<ellipse cx="27" cy="${28+by}" rx="1.5" ry="3.5" fill="${c.eye}"/>`;
    s += `<ellipse cx="37" cy="${28+by}" rx="1.5" ry="3.5" fill="${c.eye}"/>`;
  }
  // 胡须
  s += `<path d="M12 ${32+by} L24 ${30+by} M10 ${36+by} L24 ${34+by}" stroke="#666" stroke-width="0.8" fill="none"/>`;
  s += `<path d="M52 ${32+by} L40 ${30+by} M54 ${36+by} L40 ${34+by}" stroke="#666" stroke-width="0.8" fill="none"/>`;
  // 腮红鼻嘴
  s += e(20, 34+by, 3, 2, c.blush); s += e(44, 34+by, 3, 2, c.blush);
  s += `<path d="M30 ${36+by} L32 ${38+by} L34 ${36+by} Z" fill="${c.nose}"/>`;
  s += `<path d="M32 ${38+by} L32 ${40+by} M29 ${42+by} Q32 ${44+by} 35 ${42+by}" stroke="#333" stroke-width="1" fill="none"/>`;
  // 身体
  s += e(32, 52+by, 12, 10, c.main);
  // 脚
  const legL = f4 < 2 ? 0 : 2, legR = f4 < 2 ? 2 : 0;
  s += e(24, 58+by+legL, 4, 3, c.main); s += e(40, 58+by+legR, 4, 3, c.main);
  // 尾巴
  const tw = Math.sin(frame * 0.4) * 6;
  s += `<path d="M44 ${52+by} Q${52+tw} ${46+by} ${50+tw} ${38+by}" stroke="${c.main}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return s;
}

function drawDog(c, state, frame) {
  const f4 = frame % 4, f8 = frame % 8, f12 = frame % 12;
  const by = f8 < 4 ? 0 : 1;
  const earY = f4 < 2 ? 0 : 1;
  const blink = f12 < 2;
  const smile = f8 < 2;
  let s = '';
  // 垂耳
  s += e(14, 26+earY, 6, 12, c.dark); s += e(50, 26+earY, 6, 12, c.dark);
  // 头
  s += e(32, 28+by, 16, 12, c.main);
  // 嘴部突出
  s += e(32, 36+by, 8, 6, c.light);
  // 眼睛
  if (state === 'sleep') {
    s += `<path d="M24 ${26+by} L30 ${26+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${26+by} L40 ${26+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if ((state === 'happy' || state === 'eat') && smile) {
    s += `<path d="M24 ${28+by} Q27 ${24+by} 30 ${28+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${28+by} Q37 ${24+by} 40 ${28+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if (blink) {
    s += `<path d="M24 ${26+by} L30 ${26+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${26+by} L40 ${26+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else {
    s += `<circle cx="27" cy="${26+by}" r="4" fill="#fff"/>`;
    s += `<circle cx="37" cy="${26+by}" r="4" fill="#fff"/>`;
    s += `<circle cx="28" cy="${26+by}" r="2.5" fill="${c.eye}"/>`;
    s += `<circle cx="38" cy="${26+by}" r="2.5" fill="${c.eye}"/>`;
    s += `<circle cx="26" cy="${25+by}" r="1" fill="#fff"/>`;
    s += `<circle cx="36" cy="${25+by}" r="1" fill="#fff"/>`;
  }
  // 大鼻子
  s += e(32, 36+by, 3, 2.5, c.nose);
  s += `<path d="M28 ${40+by} Q32 ${44+by} 36 ${40+by}" stroke="#e57373" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  // 身体
  s += e(32, 52+by, 12, 10, c.main);
  // 脚
  const legL = f4 < 2 ? 0 : 2, legR = f4 < 2 ? 2 : 0;
  s += e(24, 58+by+legL, 4, 3, c.main); s += e(40, 58+by+legR, 4, 3, c.main);
  // 尾巴
  const tw = state === 'happy' ? Math.sin(frame * 0.8) * 10 : Math.sin(frame * 0.3) * 5;
  s += `<path d="M44 ${50+by} Q${52+tw} ${44+by} ${50+tw} ${36+by}" stroke="${c.main}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return s;
}

function drawBunny(c, state, frame) {
  const f4 = frame % 4, f8 = frame % 8, f12 = frame % 12;
  const by = f8 < 4 ? 0 : 1;
  const earY = f4 < 2 ? 0 : -1;
  const blink = f12 < 2;
  const smile = f8 < 2;
  let s = '';
  // 长耳朵 - 缩短并下移
  s += `<ellipse cx="24" cy="${18+earY}" rx="4" ry="12" fill="${c.main}"/>`;
  s += `<ellipse cx="40" cy="${16}" rx="4" ry="12" fill="${c.main}"/>`;
  s += `<ellipse cx="24" cy="${18+earY}" rx="2.5" ry="9" fill="${c.pink}"/>`;
  s += `<ellipse cx="40" cy="${16}" rx="2.5" ry="9" fill="${c.pink}"/>`;
  // 头
  s += e(32, 36+by, 16, 14, c.main);
  s += e(32, 40+by, 10, 8, c.light);
  // 眼睛
  if (state === 'sleep') {
    s += `<path d="M25 ${34+by} L30 ${34+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${34+by} L39 ${34+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if ((state === 'happy' || state === 'eat') && smile) {
    s += `<path d="M25 ${36+by} Q27.5 ${32+by} 30 ${36+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${36+by} Q36.5 ${32+by} 39 ${36+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if (blink) {
    s += `<path d="M25 ${34+by} L30 ${34+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${34+by} L39 ${34+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else {
    s += e(27, 34+by, 3.5, 4, '#ff6b81'); s += e(37, 34+by, 3.5, 4, '#ff6b81');
    s += `<circle cx="28" cy="${34+by}" r="2" fill="${c.eye}"/>`;
    s += `<circle cx="38" cy="${34+by}" r="2" fill="${c.eye}"/>`;
    s += `<circle cx="26" cy="${33+by}" r="1" fill="#fff"/>`;
    s += `<circle cx="36" cy="${33+by}" r="1" fill="#fff"/>`;
  }
  // 腮红鼻
  s += e(20, 40+by, 3, 2, c.blush); s += e(44, 40+by, 3, 2, c.blush);
  s += `<ellipse cx="32" cy="${42+by}" rx="2" ry="1.5" fill="${c.nose}"/>`;
  s += `<path d="M30 ${44+by} L32 ${46+by} L34 ${44+by}" stroke="${c.eye}" stroke-width="1" fill="none"/>`;
  // 身体
  s += e(32, 54+by, 12, 8, c.main);
  // 脚
  const hop = f4 < 2 ? 0 : -2;
  s += e(24, 60+by+hop, 5, 3, c.main); s += e(40, 60+by, 5, 3, c.main);
  return s;
}

function drawBird(c, state, frame) {
  const f4 = frame % 4, f8 = frame % 8, f12 = frame % 12;
  const by = f8 < 4 ? 0 : 2;
  const blink = f12 < 2;
  const smile = f8 < 2;
  let s = '';
  // 头冠
  s += `<path d="M28 ${12-by} L32 ${6-by} L36 ${12-by}" fill="${c.light}"/>`;
  // 头
  s += e(32, 22+by, 12, 10, c.main);
  // 眼睛
  if (state === 'sleep') {
    s += `<path d="M25 ${21+by} L29 ${21+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M35 ${21+by} L39 ${21+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if ((state === 'happy' || state === 'eat') && smile) {
    s += `<path d="M25 ${23+by} Q27 ${19+by} 29 ${23+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M35 ${23+by} Q37 ${19+by} 39 ${23+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if (blink) {
    s += `<path d="M25 ${21+by} L29 ${21+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M35 ${21+by} L39 ${21+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else {
    s += `<circle cx="27" cy="${21+by}" r="3" fill="#fff"/>`;
    s += `<circle cx="37" cy="${21+by}" r="3" fill="#fff"/>`;
    s += `<circle cx="28" cy="${21+by}" r="2" fill="${c.eye}"/>`;
    s += `<circle cx="38" cy="${21+by}" r="2" fill="${c.eye}"/>`;
  }
  // 嘴
  const beakOpen = (state === 'eat' || state === 'happy') && f4 < 2;
  s += `<path d="M29 ${26+by} L32 ${30+by} L35 ${26+by} Z" fill="${c.nose}"/>`;
  if (beakOpen) s += `<path d="M30 ${30+by} L32 ${34+by} L34 ${30+by} Z" fill="#ffcc80"/>`;
  // 身体
  s += e(32, 44+by, 10, 12, c.main); s += e(32, 46+by, 7, 8, c.light);
  // 翅膀
  const wingUp = f4 < 2;
  if (wingUp) {
    s += `<ellipse cx="20" cy="${40+by}" rx="5" ry="8" fill="${c.main}" transform="rotate(-20 20 ${40+by})"/>`;
    s += `<ellipse cx="44" cy="${40+by}" rx="5" ry="8" fill="${c.main}" transform="rotate(20 44 ${40+by})"/>`;
  } else {
    s += `<ellipse cx="20" cy="${48+by}" rx="4" ry="6" fill="${c.main}" transform="rotate(-10 20 ${48+by})"/>`;
    s += `<ellipse cx="44" cy="${48+by}" rx="4" ry="6" fill="${c.main}" transform="rotate(10 44 ${48+by})"/>`;
  }
  // 脚
  s += `<path d="M28 ${54+by} L26 ${60+by} M28 ${54+by} L28 ${60+by} M28 ${54+by} L30 ${60+by}" stroke="${c.nose}" stroke-width="2"/>`;
  s += `<path d="M36 ${54+by} L34 ${60+by} M36 ${54+by} L36 ${60+by} M36 ${54+by} L38 ${60+by}" stroke="${c.nose}" stroke-width="2"/>`;
  return s;
}

function drawPanda(c, state, frame) {
  const f4 = frame % 4, f8 = frame % 8, f12 = frame % 12;
  const by = f8 < 4 ? 0 : 1;
  const blink = f12 < 2;
  const smile = f8 < 2;
  let s = '';
  // 圆耳朵
  s += `<circle cx="16" cy="16" r="7" fill="${c.dark}"/>`;
  s += `<circle cx="48" cy="16" r="7" fill="${c.dark}"/>`;
  // 头
  s += e(32, 30+by, 18, 16, c.main);
  // 黑眼圈
  s += e(24, 28+by, 7, 6, c.dark); s += e(40, 28+by, 7, 6, c.dark);
  // 眼睛
  if (state === 'sleep') {
    s += `<path d="M21 ${28+by} L27 ${28+by}" stroke="#fff" stroke-width="2" fill="none"/>`;
    s += `<path d="M37 ${28+by} L43 ${28+by}" stroke="#fff" stroke-width="2" fill="none"/>`;
  } else if ((state === 'happy' || state === 'eat') && smile) {
    s += `<path d="M21 ${30+by} Q24 ${26+by} 27 ${30+by}" stroke="#fff" stroke-width="2" fill="none"/>`;
    s += `<path d="M37 ${30+by} Q40 ${26+by} 43 ${30+by}" stroke="#fff" stroke-width="2" fill="none"/>`;
  } else if (blink) {
    s += `<path d="M21 ${28+by} L27 ${28+by}" stroke="#fff" stroke-width="2" fill="none"/>`;
    s += `<path d="M37 ${28+by} L43 ${28+by}" stroke="#fff" stroke-width="2" fill="none"/>`;
  } else {
    s += `<circle cx="24" cy="${28+by}" r="3" fill="#fff"/>`;
    s += `<circle cx="40" cy="${28+by}" r="3" fill="#fff"/>`;
    s += `<circle cx="24" cy="${28+by}" r="1.5" fill="#333"/>`;
    s += `<circle cx="40" cy="${28+by}" r="1.5" fill="#333"/>`;
  }
  // 鼻嘴
  s += e(32, 36+by, 3, 2, c.nose);
  s += `<path d="M29 ${39+by} Q32 ${42+by} 35 ${39+by}" stroke="${c.dark}" stroke-width="1.5" fill="none"/>`;
  // 腮红
  s += e(18, 36+by, 3, 2, c.blush); s += e(46, 36+by, 3, 2, c.blush);
  // 身体
  s += e(32, 52+by, 14, 10, c.main);
  // 黑色手臂
  s += e(18, 50+by, 5, 7, c.dark); s += e(46, 50+by, 5, 7, c.dark);
  // 脚
  const legL = f4 < 2 ? 0 : 2;
  s += e(24, 58+by+legL, 5, 3, c.dark); s += e(40, 58+by, 5, 3, c.dark);
  return s;
}

function drawHamster(c, state, frame) {
  const f4 = frame % 4, f8 = frame % 8, f12 = frame % 12;
  const by = f8 < 4 ? 0 : 1;
  const blink = f12 < 2;
  const smile = f8 < 2;
  let s = '';
  // 圆耳朵
  s += `<circle cx="18" cy="18" r="5" fill="${c.main}"/>`;
  s += `<circle cx="46" cy="18" r="5" fill="${c.main}"/>`;
  s += `<circle cx="18" cy="18" r="3" fill="${c.pink}"/>`;
  s += `<circle cx="46" cy="18" r="3" fill="${c.pink}"/>`;
  // 头(圆脸)
  s += e(32, 32+by, 16, 14, c.main);
  // 腮帮子
  s += e(16, 36+by, 5, 4, c.light); s += e(48, 36+by, 5, 4, c.light);
  // 眼睛
  if (state === 'sleep') {
    s += `<path d="M25 ${30+by} L30 ${30+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${30+by} L39 ${30+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if ((state === 'happy' || state === 'eat') && smile) {
    s += `<path d="M25 ${32+by} Q27.5 ${28+by} 30 ${32+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${32+by} Q36.5 ${28+by} 39 ${32+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else if (blink) {
    s += `<path d="M25 ${30+by} L30 ${30+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
    s += `<path d="M34 ${30+by} L39 ${30+by}" stroke="${c.eye}" stroke-width="2" fill="none"/>`;
  } else {
    s += `<circle cx="27" cy="${30+by}" r="3" fill="#fff"/>`;
    s += `<circle cx="37" cy="${30+by}" r="3" fill="#fff"/>`;
    s += `<circle cx="28" cy="${30+by}" r="2" fill="${c.eye}"/>`;
    s += `<circle cx="38" cy="${30+by}" r="2" fill="${c.eye}"/>`;
    s += `<circle cx="26" cy="${29+by}" r="1" fill="#fff"/>`;
    s += `<circle cx="36" cy="${29+by}" r="1" fill="#fff"/>`;
  }
  // 腮红鼻嘴
  s += e(22, 36+by, 3, 2, c.blush); s += e(42, 36+by, 3, 2, c.blush);
  s += e(32, 38+by, 2, 1.5, c.nose);
  s += `<path d="M30 ${40+by} Q32 ${42+by} 34 ${40+by}" stroke="${c.eye}" stroke-width="1" fill="none"/>`;
  // 身体
  s += e(32, 52+by, 12, 10, c.main); s += e(32, 54+by, 8, 6, c.light);
  // 小脚
  const legL = f4 < 2 ? 0 : 2;
  s += e(24, 58+by+legL, 4, 3, c.pink); s += e(40, 58+by, 4, 3, c.pink);
  return s;
}

// 像素风绘制函数
function drawPixelCat(c, state, frame) {
  const f8 = frame % 8, by = f8 < 4 ? 0 : 1;
  let s = '';
  // 耳朵
  for (let i = 0; i < 3; i++) { s += px(8+i, 4-i, c.main); s += px(22-i, 4-i, c.main); }
  // 头
  for (let y = 6; y < 14; y++) for (let x = 6; x < 26; x++) s += px(x, y+by, c.main);
  // 眼睛
  if (state === 'sleep' || state === 'happy') {
    s += px(10, 9+by, c.eye); s += px(11, 9+by, c.eye); s += px(19, 9+by, c.eye); s += px(20, 9+by, c.eye);
  } else {
    s += px(10, 8+by, c.eye); s += px(10, 9+by, c.eye); s += px(20, 8+by, c.eye); s += px(20, 9+by, c.eye);
  }
  // 鼻嘴
  s += px(15, 11+by, c.nose); s += px(14, 12+by, c.eye); s += px(16, 12+by, c.eye);
  // 身体
  for (let y = 14; y < 22; y++) for (let x = 8; x < 24; x++) s += px(x, y+by, c.main);
  // 脚
  for (let x = 8; x < 12; x++) s += px(x, 22+by, c.main);
  for (let x = 20; x < 24; x++) s += px(x, 22+by, c.main);
  // 尾巴
  for (let i = 0; i < 4; i++) s += px(24+i, 18-i+by, c.main);
  return s;
}

function drawPixelDog(c, state, frame) {
  const f8 = frame % 8, by = f8 < 4 ? 0 : 1;
  let s = '';
  // 垂耳
  for (let y = 6; y < 14; y++) { s += px(4, y, c.dark); s += px(5, y, c.dark); s += px(25, y, c.dark); s += px(26, y, c.dark); }
  // 头
  for (let y = 5; y < 13; y++) for (let x = 7; x < 25; x++) s += px(x, y+by, c.main);
  // 眼睛
  if (state === 'sleep' || state === 'happy') {
    s += px(11, 8+by, c.eye); s += px(12, 8+by, c.eye); s += px(19, 8+by, c.eye); s += px(20, 8+by, c.eye);
  } else {
    s += px(11, 7+by, '#fff'); s += px(12, 8+by, c.eye); s += px(19, 7+by, '#fff'); s += px(20, 8+by, c.eye);
  }
  // 鼻嘴
  for (let x = 14; x < 18; x++) s += px(x, 10+by, c.light);
  s += px(15, 11+by, c.nose); s += px(16, 11+by, c.nose);
  // 身体
  for (let y = 13; y < 21; y++) for (let x = 9; x < 23; x++) s += px(x, y+by, c.main);
  // 脚
  for (let x = 9; x < 13; x++) s += px(x, 21+by, c.main);
  for (let x = 19; x < 23; x++) s += px(x, 21+by, c.main);
  // 尾巴
  for (let i = 0; i < 3; i++) s += px(23+i, 15-i+by, c.main);
  return s;
}

function drawPixelBunny(c, state, frame) {
  const f8 = frame % 8, by = f8 < 4 ? 0 : 1;
  let s = '';
  // 长耳朵
  for (let y = 0; y < 10; y++) { s += px(10, y, c.main); s += px(11, y, c.main); s += px(20, y, c.main); s += px(21, y, c.main); }
  for (let y = 2; y < 8; y++) { s += px(10, y, c.pink); s += px(20, y, c.pink); }
  // 头
  for (let y = 10; y < 18; y++) for (let x = 7; x < 25; x++) s += px(x, y+by, c.main);
  // 眼睛
  s += px(11, 13+by, '#ff6b81'); s += px(12, 13+by, c.eye); s += px(19, 13+by, '#ff6b81'); s += px(20, 13+by, c.eye);
  // 鼻
  s += px(15, 15+by, c.nose); s += px(16, 15+by, c.nose);
  // 身体
  for (let y = 18; y < 24; y++) for (let x = 9; x < 23; x++) s += px(x, y+by, c.main);
  // 脚
  for (let x = 9; x < 14; x++) s += px(x, 24+by, c.main);
  for (let x = 18; x < 23; x++) s += px(x, 24+by, c.main);
  return s;
}

function drawPixelBird(c, state, frame) {
  const f4 = frame % 4, f8 = frame % 8, by = f8 < 4 ? 0 : 1;
  let s = '';
  // 头冠
  s += px(15, 2-by, c.light); s += px(16, 2-by, c.light); s += px(15, 3-by, c.light); s += px(16, 3-by, c.light);
  // 头
  for (let y = 4; y < 12; y++) for (let x = 10; x < 22; x++) s += px(x, y+by, c.main);
  // 眼睛
  s += px(12, 7+by, '#fff'); s += px(13, 7+by, c.eye); s += px(18, 7+by, '#fff'); s += px(19, 7+by, c.eye);
  // 嘴
  s += px(15, 10+by, c.nose); s += px(16, 10+by, c.nose); s += px(15, 11+by, c.nose);
  // 身体
  for (let y = 12; y < 22; y++) for (let x = 11; x < 21; x++) s += px(x, y+by, c.main);
  // 翅膀
  const wy = f4 < 2 ? 14 : 16;
  for (let y = wy; y < wy+4; y++) { s += px(8, y+by, c.main); s += px(9, y+by, c.main); s += px(22, y+by, c.main); s += px(23, y+by, c.main); }
  // 脚
  s += px(13, 22+by, c.nose); s += px(14, 22+by, c.nose); s += px(17, 22+by, c.nose); s += px(18, 22+by, c.nose);
  return s;
}

function drawPixelPanda(c, state, frame) {
  const f8 = frame % 8, by = f8 < 4 ? 0 : 1;
  let s = '';
  // 耳朵
  for (let y = 2; y < 6; y++) for (let x = 5; x < 9; x++) s += px(x, y, c.dark);
  for (let y = 2; y < 6; y++) for (let x = 23; x < 27; x++) s += px(x, y, c.dark);
  // 头
  for (let y = 6; y < 16; y++) for (let x = 6; x < 26; x++) s += px(x, y+by, c.main);
  // 黑眼圈+眼睛
  for (let y = 8; y < 12; y++) for (let x = 8; x < 13; x++) s += px(x, y+by, c.dark);
  for (let y = 8; y < 12; y++) for (let x = 19; x < 24; x++) s += px(x, y+by, c.dark);
  s += px(10, 10+by, '#fff'); s += px(21, 10+by, '#fff');
  // 鼻
  s += px(15, 13+by, c.dark); s += px(16, 13+by, c.dark);
  // 身体
  for (let y = 16; y < 24; y++) for (let x = 8; x < 24; x++) s += px(x, y+by, c.main);
  // 黑手臂
  for (let y = 17; y < 22; y++) { s += px(6, y+by, c.dark); s += px(7, y+by, c.dark); s += px(24, y+by, c.dark); s += px(25, y+by, c.dark); }
  // 脚
  for (let x = 9; x < 13; x++) s += px(x, 24+by, c.dark);
  for (let x = 19; x < 23; x++) s += px(x, 24+by, c.dark);
  return s;
}

function drawPixelHamster(c, state, frame) {
  const f8 = frame % 8, by = f8 < 4 ? 0 : 1;
  let s = '';
  // 耳朵
  for (let y = 4; y < 8; y++) { s += px(6, y, c.main); s += px(7, y, c.pink); s += px(24, y, c.main); s += px(25, y, c.pink); }
  // 头
  for (let y = 8; y < 18; y++) for (let x = 6; x < 26; x++) s += px(x, y+by, c.main);
  // 腮帮
  for (let y = 12; y < 16; y++) { s += px(4, y+by, c.light); s += px(5, y+by, c.light); s += px(26, y+by, c.light); s += px(27, y+by, c.light); }
  // 眼睛
  s += px(11, 11+by, '#fff'); s += px(12, 12+by, c.eye); s += px(19, 11+by, '#fff'); s += px(20, 12+by, c.eye);
  // 腮红鼻
  s += px(9, 14+by, c.blush); s += px(22, 14+by, c.blush);
  s += px(15, 14+by, c.nose); s += px(16, 14+by, c.nose);
  // 身体
  for (let y = 18; y < 24; y++) for (let x = 10; x < 22; x++) s += px(x, y+by, c.main);
  // 脚
  for (let x = 10; x < 14; x++) s += px(x, 24+by, c.pink);
  for (let x = 18; x < 22; x++) s += px(x, 24+by, c.pink);
  return s;
}

export function generatePetSvg(type = 'cat', state = 'idle', frame = 0, style = 'cute') {
  const c = COLORS[type] || COLORS.cat;
  let body = '';
  if (style === 'pixel') {
    if(type === 'dog') body = drawPixelDog(c, state, frame);
    else if(type === 'bunny') body = drawPixelBunny(c, state, frame);
    else if(type === 'bird') body = drawPixelBird(c, state, frame);
    else if(type === 'panda') body = drawPixelPanda(c, state, frame);
    else if(type === 'hamster') body = drawPixelHamster(c, state, frame);
    else body = drawPixelCat(c, state, frame);
  } else {
    if(type === 'dog') body = drawDog(c, state, frame);
    else if(type === 'bunny') body = drawBunny(c, state, frame);
    else if(type === 'bird') body = drawBird(c, state, frame);
    else if(type === 'panda') body = drawPanda(c, state, frame);
    else if(type === 'hamster') body = drawHamster(c, state, frame);
    else body = drawCat(c, state, frame);
  }
  const bounce = state === 'jump' ? `transform="translate(0,${frame%2?-4:0})"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 68"><g ${bounce}>${body}</g></svg>`;
}
