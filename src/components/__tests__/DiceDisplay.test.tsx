import React from 'react';
import { render, screen } from '@testing-library/react';
import { DiceDisplay } from '../DiceDisplay';
import type { DiceRoll } from '@/types/diceTypes';
import { SPECIAL_DIE_INFO } from '@/types/diceTypes';

describe('DiceDisplay', () => {
  const defaultRoll: DiceRoll = {
    dice1: 3,
    dice2: 4,
    sum: 7
  };

  it('renders dice values correctly', () => {
    render(<DiceDisplay roll={defaultRoll} isRolling={false} />);
    
    expect(screen.getByRole('img', { name: /first die showing 3/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /second die showing 4/i })).toBeInTheDocument();
    expect(screen.getByText('Sum: 7')).toBeInTheDocument();
  });

  it('renders animation classes when rolling', () => {
    const { container } = render(
      <DiceDisplay roll={defaultRoll} isRolling={true} />
    );

    // Check that all three elements (container and both dice) have animations
    const containerElement = container.querySelector('.flex.flex-col');
    expect(containerElement).toHaveClass('animate-bounce');

    const firstDie = screen.getByRole('img', { name: /first die showing 3/i });
    const secondDie = screen.getByRole('img', { name: /second die showing 4/i });
    
    expect(firstDie).toHaveClass('animate-bounce');
    expect(secondDie).toHaveClass('animate-bounce', 'delay-100');
  });

  it('renders special die with correct colors and layout', () => {
    Object.entries(SPECIAL_DIE_INFO).forEach(([face, { color, icon, label }]) => {
      const specialRoll: DiceRoll = {
        ...defaultRoll,
        specialDie: face as DiceRoll['specialDie']
      };

      const { container } = render(
        <DiceDisplay roll={specialRoll} isRolling={false} />
      );

      const specialDieContainer = container.querySelector('.flex.items-center.gap-2.mt-2');
      expect(specialDieContainer).toBeInTheDocument();

      // Check color dot
      const colorClass = color.split(' ')[0]; // Gets the first class, e.g., 'bg-red-500' from 'bg-red-500 other-class'
      const colorDot = specialDieContainer?.querySelector(`.${colorClass}`);
      expect(colorDot).toBeInTheDocument();

      // Check icon and label are present
      expect(specialDieContainer?.textContent).toContain(icon);
      expect(specialDieContainer?.textContent).toContain(label);
    });
  });

  it('handles invalid special die values gracefully', () => {
    const rollWithInvalidSpecialDie: DiceRoll = {
      ...defaultRoll,
      specialDie: 'invalid-face' as any
    };

    render(<DiceDisplay roll={rollWithInvalidSpecialDie} isRolling={false} />);
    const specialDieContainer = screen.queryByTitle(/die face/i);
    expect(specialDieContainer).not.toBeInTheDocument();
  });

  it('maintains accessibility attributes', () => {
    render(<DiceDisplay roll={defaultRoll} isRolling={false} />);
    
    const firstDie = screen.getByRole('img', { name: /first die showing 3/i });
    const secondDie = screen.getByRole('img', { name: /second die showing 4/i });
    
    expect(firstDie).toHaveAttribute('aria-label', 'First die showing 3');
    expect(secondDie).toHaveAttribute('aria-label', 'Second die showing 4');
  });

  it('has live region for screen readers', () => {
    const { container } = render(<DiceDisplay roll={defaultRoll} isRolling={false} />);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('maintains responsive layout', () => {
    const { container } = render(<DiceDisplay roll={defaultRoll} isRolling={false} />);
    
    const parentFlex = container.querySelector('.flex.flex-col');
    expect(parentFlex).toBeInTheDocument();
    expect(parentFlex).toHaveClass('items-center', 'justify-center', 'space-y-4');

    const diceContainer = container.querySelector('.flex.justify-center.space-x-4');
    expect(diceContainer).toBeInTheDocument();

    const diceElements = container.querySelectorAll('.w-16.h-16');
    expect(diceElements).toHaveLength(2);
    expect(diceElements[0]).toHaveClass(
      'bg-white',
      'dark:bg-gray-700',
      'border-2',
      'border-gray-300',
      'dark:border-gray-600',
      'rounded-lg',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('does not render special die section when no special die is provided', () => {
    render(<DiceDisplay roll={defaultRoll} isRolling={false} />);
    const specialDieContainer = screen.queryByTitle(/die face/i);
    expect(specialDieContainer).not.toBeInTheDocument();
  });
});