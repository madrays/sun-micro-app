// Sun-Panel 天气微应用入口
import { WeatherWidget } from './components/weather-widget.js';
import { WeatherConfig } from './components/weather-config.js';
import appConfig from '../config/app.config.js';

// 组件配置（与 pack.js 保持一致）
const components = {
  // 页面注册
  pages: {
    'weather-config': {
      component: WeatherConfig,
      background: 'rgba(255, 255, 255, 0.85)',
      headerTextColor: '#1f2937'
    }
  },

  // 小部件注册
  widgets: {
    'weather-widget': {
      component: WeatherWidget,
      configComponentName: 'weather-config',
      size: ['1x1', '1x2', '1xfull', '2x1', '2x2', '2x4'],
      background: 'transparent',
      isModifyBackground: true
    }
  }
};

// 是否开发模式（根据环境变量动态判断）
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

// 获取 microAppId（开发模式添加 -dev 后缀）
const getMicroAppId = (config) => {
  return isDev ? `${config.microAppId}-dev` : config.microAppId;
};

// 导出配置
export default {
  appConfig: {
    ...appConfig,
    microAppId: getMicroAppId(appConfig),
    dev: isDev
  },
  components
};
