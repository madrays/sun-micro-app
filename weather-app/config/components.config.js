import { WeatherWidget } from '../src/components/weather-widget.js';
import { WeatherConfig } from '../src/components/weather-config.js';

export default {
  pages: {
    'weather-config': {
      component: WeatherConfig,
      background: 'rgba(255, 255, 255, 0.85)',
      headerTextColor: '#1f2937'
    }
  },

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
