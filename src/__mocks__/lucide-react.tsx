import * as React from 'react';

// Create a generic icon component factory
const createMockIcon = (name: string) => 
  React.forwardRef((props: any, ref: any) => (
    <div
      data-testid={`${name.toLowerCase()}-icon`}
      ref={ref}
      {...props}
    />
  ));

// Mock all icons used in the app
export const Volume2 = createMockIcon('volume-2');
export const VolumeX = createMockIcon('volume-x');
export const RotateCcw = createMockIcon('rotate-ccw');
export const Loader = createMockIcon('loader');
export const Swords = createMockIcon('swords');
export const Settings = createMockIcon('settings');

// Add displayNames for better debugging
Volume2.displayName = 'Volume2';
VolumeX.displayName = 'VolumeX';
RotateCcw.displayName = 'RotateCcw';
Loader.displayName = 'Loader';
Swords.displayName = 'Swords';
Settings.displayName = 'Settings';