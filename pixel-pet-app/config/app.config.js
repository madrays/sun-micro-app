export default {
  author: 'Madrays',
  microAppId: 'madrays-pixel-pet',
  version: '1.0.0',
  entry: 'main.js',
  icon: 'logo.png',
  appInfo: {
    'zh-CN': {
      appName: '像素宠物',
      description: '可爱的像素宠物，需要你的照顾'
    }
  },
  permissions: ['dataNode'],
  dataNodes: {
    'pet-state': { scope: 'app', isPublic: true }
  }
};
