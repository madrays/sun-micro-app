export default {
  author: 'Madrays',
  microAppId: 'madrays-weather',
  version: '1.0.0',
  entry: 'main.js',
  icon: 'logo.png',

  appInfo: {
    'zh-CN': {
      appName: '天气',
      description: '基于和风天气API的天气小部件，支持实时天气、小时预报、多日预报',
      networkDescription: '用于调用和风天气API获取天气数据'
    },
    'en-US': {
      appName: 'Weather',
      description: 'Weather widget based on QWeather API, supports real-time weather, hourly and daily forecast',
      networkDescription: 'Used to call QWeather API for weather data'
    }
  },

  permissions: ['network', 'dataNode'],

  networkDomains: [
    'devapi.qweather.com',
    'api.qweather.com',
    'restapi.amap.com'
  ],

  dataNodes: {
    config: {
      scope: 'app',
      isPublic: true
    },
    settings: {
      scope: 'app',
      isPublic: true
    }
  }
};
