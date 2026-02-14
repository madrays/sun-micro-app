import { html } from 'lit';

// SVG 天气图标 - 简洁动态风格
const svgIcons = {
  // 晴天 - 太阳
  sunny: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .sun-ray { animation: rotate 20s linear infinite; transform-origin: center; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      </style>
      <g class="sun-ray">
        <circle cx="32" cy="32" r="12" fill="#FFB800"/>
        <g stroke="#FFB800" stroke-width="2.5" stroke-linecap="round">
          <line x1="32" y1="6" x2="32" y2="14"/>
          <line x1="32" y1="50" x2="32" y2="58"/>
          <line x1="6" y1="32" x2="14" y2="32"/>
          <line x1="50" y1="32" x2="58" y2="32"/>
          <line x1="13.6" y1="13.6" x2="19.3" y2="19.3"/>
          <line x1="44.7" y1="44.7" x2="50.4" y2="50.4"/>
          <line x1="13.6" y1="50.4" x2="19.3" y2="44.7"/>
          <line x1="44.7" y1="19.3" x2="50.4" y2="13.6"/>
        </g>
      </g>
    </svg>
  `,

  // 晴夜 - 月亮
  clearNight: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 12C28.6 12 21 19.6 21 29C21 38.4 28.6 46 38 46C41.2 46 44.2 45.1 46.8 43.5C43.4 48.9 37.4 52.5 30.5 52.5C20.3 52.5 12 44.2 12 34C12 23.8 20.3 15.5 30.5 15.5C33.3 15.5 35.9 16.1 38.2 17.2C38.1 15.5 38 13.7 38 12Z" fill="#A0AEC0"/>
    </svg>
  `,

  // 多云
  cloudy: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .cloud-move { animation: float 4s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
      </style>
      <g class="cloud-move">
        <path d="M48 38H18C13.6 38 10 34.4 10 30C10 25.6 13.6 22 18 22C18.3 22 18.6 22 18.9 22.1C20.3 16.5 25.4 12.5 31.5 12.5C38.4 12.5 44.1 17.6 44.9 24.2C45.3 24.1 45.6 24 46 24C50.4 24 54 27.6 54 32C54 35.3 51.9 38 48 38Z" fill="#94A3B8"/>
      </g>
    </svg>
  `,

  // 少云/晴间多云
  partlyCloudy: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .sun-spin { animation: spin 20s linear infinite; transform-origin: 20px 18px; }
        .cloud-drift { animation: drift 4s ease-in-out infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes drift { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
      </style>
      <g class="sun-spin">
        <circle cx="20" cy="18" r="8" fill="#FFB800"/>
        <g stroke="#FFB800" stroke-width="2" stroke-linecap="round">
          <line x1="20" y1="4" x2="20" y2="8"/>
          <line x1="20" y1="28" x2="20" y2="32"/>
          <line x1="6" y1="18" x2="10" y2="18"/>
          <line x1="30" y1="18" x2="34" y2="18"/>
        </g>
      </g>
      <g class="cloud-drift">
        <path d="M50 44H22C17.6 44 14 40.4 14 36C14 31.6 17.6 28 22 28C22.3 28 22.6 28 22.9 28.1C24.3 22.5 29.4 18.5 35.5 18.5C42.4 18.5 48.1 23.6 48.9 30.2C49.3 30.1 49.6 30 50 30C54.4 30 58 33.6 58 38C58 41.3 55.9 44 50 44Z" fill="#94A3B8"/>
      </g>
    </svg>
  `,

  // 阴天
  overcast: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .cloud1 { animation: move1 5s ease-in-out infinite; }
        .cloud2 { animation: move2 4s ease-in-out infinite; }
        @keyframes move1 { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
        @keyframes move2 { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-2px); } }
      </style>
      <g class="cloud1">
        <path d="M44 28H20C16.7 28 14 25.3 14 22C14 18.7 16.7 16 20 16C20.2 16 20.4 16 20.6 16.1C21.7 12 25.4 9 30 9C35.2 9 39.4 12.8 40 17.8C40.3 17.7 40.6 17.6 41 17.6C44.3 17.6 47 20.3 47 23.6C47 26.1 45.5 28 44 28Z" fill="#CBD5E1"/>
      </g>
      <g class="cloud2">
        <path d="M52 46H18C12.5 46 8 41.5 8 36C8 30.5 12.5 26 18 26C18.4 26 18.8 26 19.2 26.1C21 18.8 27.5 13.5 35.2 13.5C44 13.5 51.2 20 52.2 28.4C52.7 28.3 53.1 28.2 53.6 28.2C59.1 28.2 63.6 32.7 63.6 38.2C63.6 42.5 60.8 46 52 46Z" fill="#94A3B8"/>
      </g>
    </svg>
  `,

  // 小雨
  lightRain: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .rain-drop { animation: fall 1s ease-in infinite; }
        .rain-drop:nth-child(2) { animation-delay: 0.2s; }
        .rain-drop:nth-child(3) { animation-delay: 0.4s; }
        @keyframes fall { 0% { opacity: 0; transform: translateY(-4px); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateY(8px); } }
      </style>
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.3 16 18.6 16 18.9 16.1C20.3 10.5 25.4 6.5 31.5 6.5C38.4 6.5 44.1 11.6 44.9 18.2C45.3 18.1 45.6 18 46 18C50.4 18 54 21.6 54 26C54 29.3 51.9 32 48 32Z" fill="#94A3B8"/>
      <g fill="#60A5FA">
        <circle class="rain-drop" cx="22" cy="42" r="2"/>
        <circle class="rain-drop" cx="32" cy="46" r="2"/>
        <circle class="rain-drop" cx="42" cy="42" r="2"/>
      </g>
    </svg>
  `,

  // 中雨/大雨
  rain: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .rain-line { animation: rainfall 0.8s linear infinite; }
        .rain-line:nth-child(2) { animation-delay: 0.15s; }
        .rain-line:nth-child(3) { animation-delay: 0.3s; }
        .rain-line:nth-child(4) { animation-delay: 0.45s; }
        .rain-line:nth-child(5) { animation-delay: 0.6s; }
        @keyframes rainfall { 0% { opacity: 0; transform: translateY(-6px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(10px); } }
      </style>
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.3 14 18.6 14 18.9 14.1C20.3 8.5 25.4 4.5 31.5 4.5C38.4 4.5 44.1 9.6 44.9 16.2C45.3 16.1 45.6 16 46 16C50.4 16 54 19.6 54 24C54 27.3 51.9 30 48 30Z" fill="#64748B"/>
      <g stroke="#3B82F6" stroke-width="2" stroke-linecap="round">
        <line class="rain-line" x1="18" y1="38" x2="18" y2="46"/>
        <line class="rain-line" x1="26" y1="40" x2="26" y2="50"/>
        <line class="rain-line" x1="34" y1="38" x2="34" y2="48"/>
        <line class="rain-line" x1="42" y1="40" x2="42" y2="50"/>
        <line class="rain-line" x1="50" y1="38" x2="50" y2="46"/>
      </g>
    </svg>
  `,

  // 雷阵雨
  thunderstorm: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .lightning { animation: flash 2s ease-in-out infinite; }
        @keyframes flash { 0%, 90%, 100% { opacity: 1; } 92%, 94% { opacity: 0.3; } }
      </style>
      <path d="M48 28H18C13.6 28 10 24.4 10 20C10 15.6 13.6 12 18 12C18.3 12 18.6 12 18.9 12.1C20.3 6.5 25.4 2.5 31.5 2.5C38.4 2.5 44.1 7.6 44.9 14.2C45.3 14.1 45.6 14 46 14C50.4 14 54 17.6 54 22C54 25.3 51.9 28 48 28Z" fill="#475569"/>
      <path class="lightning" d="M36 30L30 42H36L32 54L44 38H36L40 30H36Z" fill="#FBBF24"/>
      <g stroke="#3B82F6" stroke-width="2" stroke-linecap="round" opacity="0.7">
        <line x1="18" y1="36" x2="18" y2="42"/>
        <line x1="50" y1="36" x2="50" y2="42"/>
      </g>
    </svg>
  `,

  // 雪
  snow: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .snowflake { animation: snowfall 2s ease-in-out infinite; }
        .snowflake:nth-child(2) { animation-delay: 0.4s; }
        .snowflake:nth-child(3) { animation-delay: 0.8s; }
        .snowflake:nth-child(4) { animation-delay: 1.2s; }
        @keyframes snowfall { 0%, 100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(4px); } }
      </style>
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.3 14 18.6 14 18.9 14.1C20.3 8.5 25.4 4.5 31.5 4.5C38.4 4.5 44.1 9.6 44.9 16.2C45.3 16.1 45.6 16 46 16C50.4 16 54 19.6 54 24C54 27.3 51.9 30 48 30Z" fill="#94A3B8"/>
      <g fill="#E2E8F0">
        <circle class="snowflake" cx="20" cy="42" r="3"/>
        <circle class="snowflake" cx="32" cy="48" r="3"/>
        <circle class="snowflake" cx="44" cy="42" r="3"/>
        <circle class="snowflake" cx="26" cy="54" r="2"/>
      </g>
    </svg>
  `,

  // 雾
  fog: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .fog-line { animation: fogmove 3s ease-in-out infinite; }
        .fog-line:nth-child(2) { animation-delay: 0.5s; }
        .fog-line:nth-child(3) { animation-delay: 1s; }
        .fog-line:nth-child(4) { animation-delay: 1.5s; }
        @keyframes fogmove { 0%, 100% { opacity: 0.4; transform: translateX(0); } 50% { opacity: 0.8; transform: translateX(4px); } }
      </style>
      <g stroke="#94A3B8" stroke-width="4" stroke-linecap="round">
        <line class="fog-line" x1="10" y1="20" x2="54" y2="20"/>
        <line class="fog-line" x1="14" y1="30" x2="50" y2="30"/>
        <line class="fog-line" x1="10" y1="40" x2="54" y2="40"/>
        <line class="fog-line" x1="14" y1="50" x2="50" y2="50"/>
      </g>
    </svg>
  `,

  // 霾/沙尘
  haze: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .haze-dot { animation: hazefloat 2s ease-in-out infinite; }
        @keyframes hazefloat { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      </style>
      <g fill="#D4A574" class="haze-dot">
        <circle cx="16" cy="20" r="4" style="animation-delay: 0s"/>
        <circle cx="32" cy="16" r="5" style="animation-delay: 0.3s"/>
        <circle cx="48" cy="22" r="4" style="animation-delay: 0.6s"/>
        <circle cx="24" cy="32" r="6" style="animation-delay: 0.2s"/>
        <circle cx="44" cy="36" r="5" style="animation-delay: 0.5s"/>
        <circle cx="18" cy="46" r="4" style="animation-delay: 0.4s"/>
        <circle cx="36" cy="48" r="5" style="animation-delay: 0.1s"/>
        <circle cx="52" cy="50" r="3" style="animation-delay: 0.7s"/>
      </g>
    </svg>
  `,

  // 未知
  unknown: html`
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="#94A3B8" stroke-width="3" fill="none"/>
      <text x="32" y="40" text-anchor="middle" fill="#94A3B8" font-size="24" font-weight="bold">?</text>
    </svg>
  `
};

// 和风天气图标代码映射到 SVG
const codeToIcon = {
  // 晴
  '100': 'sunny', '150': 'clearNight',
  // 多云
  '101': 'partlyCloudy', '102': 'partlyCloudy', '103': 'partlyCloudy',
  '104': 'overcast',
  '151': 'clearNight', '152': 'clearNight', '153': 'clearNight',
  // 雨
  '300': 'lightRain', '301': 'lightRain',
  '302': 'thunderstorm', '303': 'thunderstorm', '304': 'thunderstorm',
  '305': 'lightRain', '306': 'rain', '307': 'rain', '308': 'rain', '309': 'lightRain',
  '310': 'rain', '311': 'rain', '312': 'rain', '313': 'rain',
  '314': 'lightRain', '315': 'rain', '316': 'rain', '317': 'rain', '318': 'rain',
  '350': 'lightRain', '351': 'lightRain', '399': 'rain',
  // 雪
  '400': 'snow', '401': 'snow', '402': 'snow', '403': 'snow',
  '404': 'snow', '405': 'snow', '406': 'snow', '407': 'snow',
  '408': 'snow', '409': 'snow', '410': 'snow',
  '456': 'snow', '457': 'snow', '499': 'snow',
  // 雾霾沙尘
  '500': 'fog', '501': 'fog', '502': 'haze', '503': 'haze', '504': 'haze',
  '507': 'haze', '508': 'haze', '509': 'fog', '510': 'fog',
  '511': 'haze', '512': 'haze', '513': 'haze', '514': 'haze', '515': 'haze',
  // 其他
  '900': 'sunny', '901': 'snow', '999': 'unknown'
};

export function getWeatherIcon(code) {
  const iconKey = codeToIcon[code] || 'unknown';
  return svgIcons[iconKey] || svgIcons.unknown;
}

// 空气质量等级颜色 - 更柔和的配色
export const aqiColors = {
  '优': '#22C55E',
  '良': '#EAB308',
  '轻度污染': '#F97316',
  '中度污染': '#EF4444',
  '重度污染': '#A855F7',
  '严重污染': '#7C2D12'
};

export function getAqiColor(category) {
  return aqiColors[category] || '#6B7280';
}

// 获取 AQI 背景色（带透明度）
export function getAqiBgColor(category) {
  const colors = {
    '优': 'rgba(34, 197, 94, 0.15)',
    '良': 'rgba(234, 179, 8, 0.15)',
    '轻度污染': 'rgba(249, 115, 22, 0.15)',
    '中度污染': 'rgba(239, 68, 68, 0.15)',
    '重度污染': 'rgba(168, 85, 247, 0.15)',
    '严重污染': 'rgba(124, 45, 18, 0.15)'
  };
  return colors[category] || 'rgba(107, 114, 128, 0.15)';
}
