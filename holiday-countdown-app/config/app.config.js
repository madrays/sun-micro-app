export default {
  author: 'Madrays',
  microAppId: 'madrays-holiday-countdown',
  version: '1.0.0',
  entry: 'main.js',
  icon: 'logo.png',

  appInfo: {
    'zh-CN': {
      appName: '节假日倒计时',
      description: '自动计算当前日期到中国节假日的倒计时，并按节日主题展示漫画 SVG',
      networkDescription: '用于调用 holiday.ailcc.com 获取节假日与调休数据'
    },
    'en-US': {
      appName: 'Holiday Countdown',
      description: 'Auto countdown to Chinese holidays with themed SVG illustrations',
      networkDescription: 'Used to request holiday and adjusted workday data from holiday.ailcc.com'
    }
  },

  permissions: ['network'],
  networkDomains: ['holiday.ailcc.com'],
  dataNodes: {}
};
