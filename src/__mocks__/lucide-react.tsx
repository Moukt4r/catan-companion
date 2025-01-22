import React from 'react';

// Create a mock component factory
const createMockIcon = (name: string) => 
  React.forwardRef((props: any, ref: any) => {
    const MockIcon = () => (
      <div data-testid={`${name.toLowerCase()}-icon`} ref={ref} {...props} style={{ width: props.size, height: props.size }} />
    );
    MockIcon.displayName = name;
    return <MockIcon />;
  });

// Export all icon components
export const Volume2 = createMockIcon('Volume2');
export const VolumeX = createMockIcon('VolumeX');
export const RotateCcw = createMockIcon('RotateCcw');
export const Loader = createMockIcon('Loader');
export const Swords = createMockIcon('Swords');
export const Settings = createMockIcon('Settings');