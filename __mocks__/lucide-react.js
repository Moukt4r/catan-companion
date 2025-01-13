// Mock all lucide icons
const mockIcon = ({ size = 24, color = 'currentColor', ...props } = {}) => {
  return {
    type: 'svg',
    props: {
      width: size,
      height: size,
      fill: 'none',
      stroke: color,
      ...props,
    },
  };
};

// Export all icons used in the app
export const ShieldAlert = mockIcon;
export const GalleryVerticalEnd = mockIcon;
export const Building2 = mockIcon;
export const Lightbulb = mockIcon;
export const ShoppingCart = mockIcon;
export const Ban = mockIcon;
export const Settings = mockIcon;
export const BarChart2 = mockIcon;
export const Save = mockIcon;
export const RotateCcw = mockIcon;
export const Sun = mockIcon;
export const Moon = mockIcon;
export const Volume2 = mockIcon;
export const VolumeX = mockIcon;
export const Monitor = mockIcon;
export const Zap = mockIcon;
export const ZapOff = mockIcon;