import React from 'react';

// Create mock icon factory
const createMockIcon = (name) => React.forwardRef((props, ref) => (
  <span
    data-testid={`mock-${name.toLowerCase()}-icon`}
    ref={ref}
    {...props}
  />
));

// Export mocked icons
export const Swords = createMockIcon('Swords');
export const Settings = createMockIcon('Settings');

// Add displayNames for debugging
Swords.displayName = 'Swords';
Settings.displayName = 'Settings';