import { HolidayCountdownWidget } from '../src/components/holiday-countdown-widget.js';
import { HolidayCountdownConfig } from '../src/components/holiday-countdown-config.js';

export default {
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
