import * as React from 'react';

// Create a generic icon component factory
const createMockIcon = (name: string) => 
  React.forwardRef((props: any, ref: any) => (
    <span
      data-testid={`mock-${name.toLowerCase()}-icon`}
      ref={ref}
      {...props}
    />
  ));

// Mock all icons used in the app
export const Swords = createMockIcon('Swords');
export const Settings = createMockIcon('Settings');

// Add displayNames for better debugging
Swords.displayName = 'Swords';
Settings.displayName = 'Settings';