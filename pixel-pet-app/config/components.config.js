import { PixelPetWidget } from '../src/components/pixel-pet-widget.js';
import { PixelPetConfig } from '../src/components/pixel-pet-config.js';

export default {
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
