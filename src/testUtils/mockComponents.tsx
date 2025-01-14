import React from 'react';

// Mock Lucide Icons
jest.mock('lucide-react', () => ({
  Loader: () => <span data-testid="loader-icon" />,
  RotateCcw: () => <span data-testid="reset-icon" />,
  Volume2: () => <span data-testid="volume-on-icon" />,
  VolumeX: () => <span data-testid="volume-off-icon" />,
  Sun: () => <span data-testid="sun-icon" />,
  Moon: () => <span data-testid="moon-icon" />,
  Users: () => <span data-testid="users-icon" />,
  User: () => <span data-testid="user-icon" />,
  Plus: () => <span data-testid="plus-icon" />,
  Minus: () => <span data-testid="minus-icon" />,
  Crown: () => <span data-testid="crown-icon" />,
  Award: () => <span data-testid="award-icon" />,
  ChevronRight: () => <span data-testid="chevron-right-icon" />,
  Swords: () => <span data-testid="swords-icon" />,
}));

// Mock DiceDisplay
jest.mock('../components/DiceDisplay', () => ({
  __esModule: true,
  default: ({ roll }) => (
    <div data-testid="dice-display">
      {`${roll.dice1} + ${roll.dice2} = ${roll.sum}`}
      {roll.specialDie && ` (${roll.specialDie})`}
    </div>
  ),
}));
