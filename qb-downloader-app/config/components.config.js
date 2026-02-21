import { QbWidget } from '../src/components/qb-widget.js';
import { QbConfig } from '../src/components/qb-config.js';

export default {
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
