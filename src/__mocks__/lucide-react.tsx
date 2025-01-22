import React from 'react';

// Create a mock component factory
const createMockIcon = (name: string) => {
  const MockIcon = ({ size = 24, className, ...props }: any) => (
    <span
      data-testid={`${name.toLowerCase()}-icon`}
      className={className}
      {...props}
      style={{ width: size, height: size }}
    />
  );
  MockIcon.displayName = name;
  return MockIcon;
};

// Export all icon components that are used in the application
export const Volume2 = createMockIcon('Volume2');
export const VolumeX = createMockIcon('VolumeX');
export const RotateCcw = createMockIcon('RotateCcw');
export const Loader = createMockIcon('Loader');
export const Swords = createMockIcon('Swords');
export const Settings = createMockIcon('Settings');