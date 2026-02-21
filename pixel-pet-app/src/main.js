import { PixelPetWidget } from './components/pixel-pet-widget.js';
import { PixelPetConfig } from './components/pixel-pet-config.js';
import appConfig from '../config/app.config.js';

const components = {
  pages: {
    'pixel-pet-config': {
      component: PixelPetConfig,
      background: '#f8fafc'
    }
  },
  widgets: {
    'pixel-pet-widget': {
      component: PixelPetWidget,
      configComponentName: 'pixel-pet-config',
      size: ['2x2', '2x4'],
      background: '',
      isModifyBackground: true
    }
  }
};

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

export default {
  appConfig: {
    ...appConfig,
    microAppId: isDev ? `${appConfig.microAppId}-dev` : appConfig.microAppId,
    dev: isDev
  },
  components
};
