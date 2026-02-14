import { HolidayCountdownWidget } from './components/holiday-countdown-widget.js';
import { HolidayCountdownConfig } from './components/holiday-countdown-config.js';
import appConfig from '../config/app.config.js';

const components = {
  pages: {
    'holiday-countdown-config': {
      component: HolidayCountdownConfig,
      background: 'rgba(255, 255, 255, 0.9)',
      headerTextColor: '#0f172a'
    }
  },
  widgets: {
    'holiday-countdown-widget': {
      component: HolidayCountdownWidget,
      configComponentName: 'holiday-countdown-config',
      size: ['1x1', '1x2', '2x1', '2x2', '2x4'],
      background: 'transparent',
      isModifyBackground: true
    }
  }
};

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

const getMicroAppId = (config) => {
  return isDev ? `${config.microAppId}-dev` : config.microAppId;
};

export default {
  appConfig: {
    ...appConfig,
    microAppId: getMicroAppId(appConfig),
    dev: isDev
  },
  components
};
