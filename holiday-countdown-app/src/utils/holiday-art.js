const baseSvg = (scene) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 220">${scene}</svg>`;

const frame = (bgA, bgB, inner) => `
    <defs>
      <linearGradient id="bg-${bgA.replace('#', '')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgA}" />
        <stop offset="100%" stop-color="${bgB}" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.1"/>
      </filter>
    </defs>
    <rect x="10" y="10" width="320" height="200" rx="24" fill="url(#bg-${bgA.replace('#', '')})" opacity="0.15" />
    <rect x="10" y="10" width="320" height="200" rx="24" fill="none" stroke="rgba(15,23,42,0.08)" stroke-width="1.5"/>
    ${inner}
  `;

// 元旦：烟花与庆祝
const newYearArt = () => baseSvg(frame('#8B5CF6', '#EC4899', `
    <g transform="translate(170,110)">
      <!-- 烟花绽放 1 -->
      <g transform="translate(-60, -40) scale(0.8)">
        <circle r="4" fill="#F472B6" />
        <path d="M0,-20 L0,-35 M14,-14 L24,-24 M20,0 L35,0 M14,14 L24,24 M0,20 L0,35 M-14,14 L-24,24 M-20,0 L-35,0 M-14,-14 L-24,-24" stroke="#F472B6" stroke-width="2" stroke-linecap="round" />
      </g>
      <!-- 烟花绽放 2 -->
      <g transform="translate(60, -20) scale(0.6)">
        <circle r="4" fill="#A78BFA" />
        <path d="M0,-20 L0,-35 M14,-14 L24,-24 M20,0 L35,0 M14,14 L24,24 M0,20 L0,35 M-14,14 L-24,24 M-20,0 L-35,0 M-14,-14 L-24,-24" stroke="#A78BFA" stroke-width="2" stroke-linecap="round" />
      </g>
      <!-- 主烟花 -->
      <g transform="scale(1.2)">
         <circle r="6" fill="#FBBF24" />
         <path d="M0,-24 L0,-40 M17,-17 L28,-28 M24,0 L40,0 M17,17 L28,28 M0,24 L0,40 M-17,17 L-28,28 M-24,0 L-40,0 M-17,-17 L-28,-28" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" />
      </g>
      <!-- 飘带 -->
      <path d="M-100,60 Q-50,20 0,60 T100,60" fill="none" stroke="#F472B6" stroke-width="2" stroke-dasharray="8,8" opacity="0.6"/>
    </g>
`));

// 春节：灯笼与祥云
const springFestivalArt = () => baseSvg(frame('#EF4444', '#F59E0B', `
    <!-- 左灯笼 -->
    <g transform="translate(70, 40)">
      <rect x="-2" y="0" width="4" height="20" fill="#B91C1C" />
      <path d="M-20,20 Q-28,45 -20,70 L20,70 Q28,45 20,20 Z" fill="#DC2626" />
      <path d="M-20,20 Q0,5 20,20" fill="#B91C1C" /> <!-- Top cap -->
      <rect x="-2" y="70" width="4" height="6" fill="#F59E0B" />
      <g stroke="#B91C1C" stroke-width="1.5" fill="none">
         <path d="M-10,20 Q-14,45 -10,70 M0,20 V70 M10,20 Q14,45 10,70" opacity="0.3"/>
      </g>
      <!-- 穗 -->
      <path d="M0,76 V100" stroke="#B91C1C" stroke-width="2" />
      <path d="M-4,78 V95 M4,78 V95" stroke="#B91C1C" stroke-width="1.5" />
    </g>

    <!-- 右灯笼 (小) -->
    <g transform="translate(260, 30) scale(0.8)">
      <rect x="-2" y="0" width="4" height="20" fill="#B91C1C" />
      <path d="M-20,20 Q-28,45 -20,70 L20,70 Q28,45 20,20 Z" fill="#DC2626" />
      <path d="M-20,20 Q0,5 20,20" fill="#B91C1C" />
      <rect x="-2" y="70" width="4" height="6" fill="#F59E0B" />
      <g stroke="#B91C1C" stroke-width="1.5" fill="none">
         <path d="M-10,20 Q-14,45 -10,70 M0,20 V70 M10,20 Q14,45 10,70" opacity="0.3"/>
      </g>
      <path d="M0,76 V100" stroke="#B91C1C" stroke-width="2" />
    </g>

    <!-- 底部祥云 -->
    <path d="M40,180 Q60,160 80,180 T120,180 T160,180 T200,180" fill="none" stroke="#FCA5A5" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    <path d="M140,195 Q160,175 180,195 T220,195 T260,195 T300,195" fill="none" stroke="#FECACA" stroke-width="3" stroke-linecap="round" opacity="0.4" />
`));

// 清明：山水与柳枝
const qingmingArt = () => baseSvg(frame('#10B981', '#34D399', `
    <!-- 远山 -->
    <path d="M40,160 Q90,100 140,160 T240,160" fill="none" stroke="#6EE7B7" stroke-width="2" />
    <path d="M180,160 Q230,80 280,160" fill="none" stroke="#34D399" stroke-width="2" opacity="0.8"/>
    
    <!-- 柳枝 -->
    <g transform="translate(300, -10) rotate(15)">
      <path d="M0,0 Q-30,60 -10,120" stroke="#059669" stroke-width="2" fill="none" />
      <g fill="#34D399">
        <ellipse cx="-10" cy="30" rx="3" ry="6" transform="rotate(-15)" />
        <ellipse cx="-18" cy="50" rx="3" ry="6" transform="rotate(-10)" />
        <ellipse cx="-20" cy="70" rx="3" ry="6" transform="rotate(-5)" />
        <ellipse cx="-15" cy="90" rx="3" ry="6" transform="rotate(0)" />
        <ellipse cx="-10" cy="110" rx="3" ry="6" transform="rotate(5)" />
      </g>
    </g>
     <g transform="translate(40, -10) rotate(-10)">
      <path d="M10,0 Q30,50 10,100" stroke="#059669" stroke-width="2" fill="none" />
       <g fill="#6EE7B7">
        <ellipse cx="15" cy="30" rx="2" ry="5" transform="rotate(15)" />
        <ellipse cx="20" cy="50" rx="2" ry="5" transform="rotate(10)" />
        <ellipse cx="18" cy="70" rx="2" ry="5" transform="rotate(5)" />
      </g>
    </g>
    
    <!-- 细雨 -->
    <g stroke="#A7F3D0" stroke-width="1.5" stroke-linecap="round">
       <line x1="100" y1="50" x2="95" y2="60" />
       <line x1="150" y1="70" x2="145" y2="80" />
       <line x1="200" y1="40" x2="195" y2="50" />
       <line x1="120" y1="100" x2="115" y2="110" />
       <line x1="230" y1="90" x2="225" y2="100" />
    </g>
`));

// 劳动节：工具与勋章
const laborArt = () => baseSvg(frame('#F59E0B', '#F97316', `
    <g transform="translate(170, 110)">
      <!-- 齿轮 (简化) -->
      <path d="M-35,-35 h20 l5,-10 h20 l5,10 h20 v20 l10,5 v20 l-10,5 v20 h-20 l-5,10 h-20 l-5,-10 h-20 v-20 l-10,-5 v-20 l10,-5 Z" 
            fill="none" stroke="#B45309" stroke-width="3" opacity="0.2" transform="rotate(15)"/>
            
      <!-- 麦穗 (左) -->
      <g transform="stroke:#F59E0B; stroke-width:2; fill:#FCD34D" >
         <ellipse cx="-20" cy="10" rx="4" ry="8" transform="rotate(-30, -20, 10)" />
         <ellipse cx="-20" cy="-5" rx="4" ry="8" transform="rotate(-30, -20, -5)" />
         <ellipse cx="-20" cy="-20" rx="4" ry="8" transform="rotate(-30, -20, -20)" />
         <path d="M-20,40 Q-20,0 -20,-30" stroke="#D97706" fill="none" />
      </g>
      <!-- 麦穗 (右) -->
      <g transform="scale(-1, 1) stroke:#F59E0B; stroke-width:2; fill:#FCD34D" >
         <ellipse cx="-20" cy="10" rx="4" ry="8" transform="rotate(-30, -20, 10)" />
         <ellipse cx="-20" cy="-5" rx="4" ry="8" transform="rotate(-30, -20, -5)" />
         <ellipse cx="-20" cy="-20" rx="4" ry="8" transform="rotate(-30, -20, -20)" />
         <path d="M-20,40 Q-20,0 -20,-30" stroke="#D97706" fill="none" />
      </g>
      
      <!-- 太阳/勋章核心 -->
      <circle r="18" fill="#FBBF24" stroke="#D97706" stroke-width="2" />
      <g stroke="#FBBF24" stroke-width="2" stroke-linecap="round">
         <line y1="-26" y2="-22" />
         <line y1="26" y2="22" />
         <line x1="-26" x2="-22" />
         <line x1="26" x2="22" />
         <line x1="18" y1="18" x2="15" y2="15" />
         <line x1="-18" y1="-18" x2="-15" y2="-15" />
         <line x1="18" y1="-18" x2="15" y2="-15" />
         <line x1="-18" y1="18" x2="-15" y2="15" />
      </g>
    </g>
`));

// 端午：龙舟与波浪
const dragonBoatArt = () => baseSvg(frame('#06B6D4', '#3B82F6', `
    <!-- 波浪背景 -->
    <path d="M20,160 Q50,140 80,160 T140,160 T200,160 T260,160 T320,160" fill="none" stroke="#93C5FD" stroke-width="2" stroke-opacity="0.6"/>
    <path d="M30,175 Q60,155 90,175 T150,175 T210,175 T270,175 T330,175" fill="none" stroke="#60A5FA" stroke-width="2" stroke-opacity="0.8"/>
    
    <!-- 龙舟简笔 -->
    <g transform="translate(140, 130)">
       <!-- 舟身 -->
       <path d="M-60,10 Q0,35 100,10 L90,-5 Q0,20 -60,-5 Z" fill="#0E7490" />
       <!-- 龙头 -->
        <g transform="translate(-60, -5)">
            <path d="M0,0 Q-10,-20 10,-30 Q25,-35 30,-20 Q35,-10 20,5 Z" fill="#EAB308" /> <!-- 头 -->
            <circle cx="15" cy="-20" r="2.5" fill="white"/> <!-- 眼 -->
            <circle cx="16" cy="-20" r="1" fill="black"/>
            <path d="M5,-30 Q0,-45 15,-40" stroke="#EAB308" stroke-width="3" fill="none" stroke-linecap="round" /> <!-- 角 -->
            <path d="M30,-20 Q40,-15 35,-5" stroke="#EAB308" stroke-width="3" fill="none" stroke-linecap="round"/> <!-- 须 -->
        </g>
       <!-- 鼓槌 -->
       <line x1="0" y1="-10" x2="10" y2="5" stroke="#94A3B8" stroke-width="3" stroke-linecap="round" />
       <circle cx="0" cy="-12" r="3" fill="#CBD5E1" />
    </g>
`));

// 中秋：圆月与玉兔
const midAutumnArt = () => baseSvg(frame('#6366F1', '#8B5CF6', `
    <!-- 月亮 -->
    <circle cx="170" cy="100" r="50" fill="#FEF3C7" filter="url(#shadow)" opacity="0.9"/>
    <circle cx="150" cy="85" r="6" fill="#FDE68A" opacity="0.6"/>
    <circle cx="190" cy="95" r="4" fill="#FDE68A" opacity="0.6"/>
    <circle cx="175" cy="120" r="8" fill="#FDE68A" opacity="0.6"/>
    
    <!-- 玉兔背影/剪影 -->
    <g transform="translate(170, 140)">
      <ellipse cx="0" cy="0" rx="12" ry="8" fill="white" /> <!-- 身体 -->
      <circle cx="-8" cy="-8" r="7" fill="white" /> <!-- 头 -->
      <ellipse cx="-6" cy="-18" rx="2.5" ry="8" fill="white" transform="rotate(-15, -6, -18)" /> <!-- 耳 -->
      <ellipse cx="-12" cy="-16" rx="2.5" ry="8" fill="white" transform="rotate(-30, -12, -16)" /> <!-- 耳 -->
      <circle cx="-16" cy="-4" r="1.5" fill="#FDA4AF" opacity="0.6"/> <!-- 腮红 -->
    </g>
    
    <!-- 云彩 -->
    <g fill="#A5B4FC" opacity="0.4">
       <circle cx="100" cy="150" r="20" />
       <circle cx="130" cy="160" r="25" />
       <circle cx="210" cy="155" r="22" />
       <circle cx="240" cy="145" r="18" />
    </g>
`));

// 国庆：红旗与星光
const nationalDayArt = () => baseSvg(frame('#EF4444', '#F472B6', `
    <!-- 飘带 -->
    <path d="M40,160 Q100,100 170,160 T300,160" fill="none" stroke="#FBBF24" stroke-width="3" opacity="0.6" />
    <path d="M60,170 Q120,120 190,170 T320,170" fill="none" stroke="#FBBF24" stroke-width="2" opacity="0.4" />

    <!-- 红旗 -->
    <g transform="translate(130, 60)">
       <path d="M0,0 L0,100" stroke="#7F1D1D" stroke-width="4" stroke-linecap="round" />
       <!-- 旗面 (飘动) -->
       <path d="M2,2 Q40,-10 80,10 Q60,30 80,60 Q40,40 2,60 Z" fill="#DC2626" />
       <!-- 大星 -->
       <g transform="translate(15, 15) scale(0.6)">
         <polygon points="10,1 12,7 19,7 13,11 15,17 10,13 5,17 7,11 1,7 8,7" fill="#FBBF24"/>
       </g>
       <!-- 小星 -->
       <g transform="translate(30, 8) scale(0.3)">
         <polygon points="10,1 12,7 19,7 13,11 15,17 10,13 5,17 7,11 1,7 8,7" fill="#FBBF24"/>
       </g>
       <g transform="translate(36, 14) scale(0.3) rotate(20)">
         <polygon points="10,1 12,7 19,7 13,11 15,17 10,13 5,17 7,11 1,7 8,7" fill="#FBBF24"/>
       </g>
        <g transform="translate(36, 22) scale(0.3) rotate(40)">
         <polygon points="10,1 12,7 19,7 13,11 15,17 10,13 5,17 7,11 1,7 8,7" fill="#FBBF24"/>
       </g>
    </g>
    
    <!-- 气球 -->
    <circle cx="90" cy="80" r="12" fill="#FCA5A5" opacity="0.8"/>
    <line x1="90" y1="92" x2="90" y2="120" stroke="#999" stroke-width="1"/>
    
    <circle cx="250" cy="100" r="10" fill="#FBBF24" opacity="0.8"/>
    <line x1="250" y1="110" x2="250" y2="130" stroke="#999" stroke-width="1"/>
`));

export const getHolidayArtSvg = (name) => {
  switch (name) {
    case '元旦节':
      return newYearArt();
    case '春节':
      return springFestivalArt();
    case '清明节':
      return qingmingArt();
    case '劳动节':
      return laborArt();
    case '端午节':
      return dragonBoatArt();
    case '中秋节':
      return midAutumnArt();
    case '国庆节':
      return nationalDayArt();
    default:
      return newYearArt();
  }
};

export const getHolidayArtDataUri = (name) => {
  const svg = getHolidayArtSvg(name);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
