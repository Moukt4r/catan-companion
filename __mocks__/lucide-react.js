const React = require('react');

const createIcon = (name) => {
  return React.forwardRef(({ size = 24, color = 'currentColor', ...props }, ref) => {
    return React.createElement(
      'svg',
      {
        ref,
        width: size,
        height: size,
        fill: 'none',
        stroke: color,
        'data-testid': `${name}-icon`,
        ...props,
      },
      React.createElement('path', {
        d: 'M0 0h24v24H0z',
        stroke: 'none',
      })
    );
  });
};

// Export all icons used in the app
module.exports = {
  ShieldAlert: createIcon('shield-alert'),
  GalleryVerticalEnd: createIcon('gallery-vertical-end'),
  Building2: createIcon('building'),
  Lightbulb: createIcon('lightbulb'),
  ShoppingCart: createIcon('shopping-cart'),
  Ban: createIcon('ban'),
  Settings: createIcon('settings'),
  BarChart2: createIcon('bar-chart'),
  Save: createIcon('save'),
  RotateCcw: createIcon('rotate-ccw'),
  Sun: createIcon('sun'),
  Moon: createIcon('moon'),
  Volume2: createIcon('volume'),
  VolumeX: createIcon('volume-x'),
  Monitor: createIcon('monitor'),
  Zap: createIcon('zap'),
  ZapOff: createIcon('zap-off'),
  X: createIcon('x'),
  Info: createIcon('info'),
  AlertTriangle: createIcon('alert-triangle'),
  Sword: createIcon('sword'),
  ThumbsUp: createIcon('thumbs-up'),
  ThumbsDown: createIcon('thumbs-down'),
  AlertCircle: createIcon('alert-circle'),
};