import { QbWidget } from './components/qb-widget.js';
import { QbConfig } from './components/qb-config.js';

const appConfig = {
  microAppId: 'madrays-qb-downloader',
  version: '1.0.0',
  author: 'Madrays',
  entry: 'main.js',
  icon: 'logo.svg'
};

const components = {
  pages: {
    'qb-config': {
      component: QbConfig,
      background: '#f8fafc'
    }
  },
  widgets: {
    'qb-widget': {
      component: QbWidget,
      configComponentName: 'qb-config',
      size: ['1x1', '1x2', '2x1', '2x2', '2x4'],
      background: '',
      isModifyBackground: true
    }
  }
};

export default { appConfig, components };
