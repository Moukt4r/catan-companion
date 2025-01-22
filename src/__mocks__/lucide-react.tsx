import React from 'react';

// Create a mock component factory
const mockIcon = {
  name: '',
  size: 24
};

const createMockIcon = (name: string) => {
  const MockIcon = ({ size = 24, ...props }: any) => (
    <span
      data-testid={`${name.toLowerCase()}-icon`}
      {...props}
      style={{ width: size, height: size }}
    />
  );
  MockIcon.displayName = name;
  return MockIcon;
};

// Export all icon components
export const Volume2 = createMockIcon('volume-2');
export const VolumeX = createMockIcon('volumex');
export const RotateCcw = createMockIcon('rotate-ccw');
export const Loader = createMockIcon('loader');
export const Swords = createMockIcon('swords');
export const Settings = createMockIcon('settings');