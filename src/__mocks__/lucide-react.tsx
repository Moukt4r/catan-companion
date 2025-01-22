import React from 'react';

const createMockIcon = (name: string) => 
  React.forwardRef(({ size = 24, ...props }: any, ref: any) => (
    <div
      data-testid={`${name.toLowerCase()}-icon`}
      ref={ref}
      {...props}
      style={{ width: size, height: size }}
    />
  ));

export const Volume2 = createMockIcon('volume-2');
export const VolumeX = createMockIcon('volume-x');
export const RotateCcw = createMockIcon('rotate-ccw');
export const Loader = createMockIcon('loader');
export const Swords = createMockIcon('swords');
export const Settings = createMockIcon('settings');

// Add display names for easier debugging
Volume2.displayName = 'Volume2';
VolumeX.displayName = 'VolumeX';
RotateCcw.displayName = 'RotateCcw';
Loader.displayName = 'Loader';
Swords.displayName = 'Swords';
Settings.displayName = 'Settings';