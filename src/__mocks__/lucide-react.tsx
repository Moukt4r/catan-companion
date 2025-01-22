import * as React from 'react';

const createMockIcon = (name: string) => {
  const IconComponent = (props: any) => (
    <div data-testid={`${name.toLowerCase()}-icon`} {...props} />
  );
  IconComponent.displayName = name;
  return IconComponent;
};

export const Volume2 = createMockIcon('volume-2');
export const VolumeX = createMockIcon('volumex');
export const RotateCcw = createMockIcon('rotate-ccw');
export const Loader = createMockIcon('loader');
export const Swords = createMockIcon('swords');
export const Settings = createMockIcon('settings');