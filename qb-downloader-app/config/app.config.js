export default {
  author: 'Madrays',
  microAppId: 'madrays-qb-downloader',
  version: '1.0.0',
  entry: 'main.js',
  icon: 'logo.svg',
  appInfo: {
    'zh-CN': {
      appName: 'QB下载器',
      description: 'qBittorrent 下载器状态监控',
      networkDescription: '用于连接 qBittorrent WebUI'
    }
  },
  permissions: ['network', 'dataNode'],
  networkDomains: ['*'],
  dataNodes: {
    config: { scope: 'app', isPublic: true }
  }
};
