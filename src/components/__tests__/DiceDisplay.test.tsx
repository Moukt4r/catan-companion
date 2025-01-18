import React from 'react';
import { render } from '@testing-library/react';
import { DiceDisplay } from '../DiceDisplay';
import { DiceRoll, SPECIAL_DIE_INFO } from '@/types/diceTypes';

describe('DiceDisplay', () => {
  const defaultProps = {
    roll: {
      dice1: 3,
      dice2: 4,
      sum: 7
    } as DiceRoll,
    isRolling: false
  };

  it('renders dice values correctly', () => {
    const { getByText } = render(<DiceDisplay {...defaultProps} />);
    expect(getByText('3')).toBeInTheDocument();
    expect(getByText('4')).toBeInTheDocument();
    expect(getByText('Sum: 7')).toBeInTheDocument();
  });

  it('renders animation class when rolling', () => {
    const { container } = render(<DiceDisplay {...defaultProps} isRolling={true} />);
    const diceElements = container.querySelectorAll('.animate-bounce');
    expect(diceElements).toHaveLength(2);
  });

  it('renders special die with correct colors and layout', () => {
    Object.entries(SPECIAL_DIE_INFO).forEach(([face, { color, icon, label }]) => {
      const { container } = render(
        <DiceDisplay
          roll={{
            ...defaultProps.roll,
            specialDie: face as DiceRoll['specialDie']
          }}
          isRolling={false}
        />
      );

      const specialDieElement = container.querySelector('.flex.items-center.gap-2.mt-2');
      expect(specialDieElement).toBeInTheDocument();

      // Check color dot
      const colorDot = specialDieElement?.querySelector(`.${color.split(' ')[0]}`);
      expect(colorDot).toBeInTheDocument();

      // Check text content
      const text = specialDieElement?.textContent;
      expect(text).toContain(icon);
      expect(text).toContain(label);
    });
  });

  it('maintains accessibility attributes', () => {
    const { getAllByRole } = render(<DiceDisplay {...defaultProps} />);
    const diceElements = getAllByRole('img');
    expect(diceElements[0]).toHaveAttribute('aria-label', 'First die showing 3');
    expect(diceElements[1]).toHaveAttribute('aria-label', 'Second die showing 4');
  });

  it('has live region for screen readers', () => {
    const { container } = render(<DiceDisplay {...defaultProps} />);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('maintains responsive layout', () => {
    const { container } = render(<DiceDisplay {...defaultProps} />);
    
    // Flex container should have space-y-4
    const parentFlex = container.querySelector('.flex.flex-col');
    expect(parentFlex).toHaveClass('space-y-4');

    // Dice container should have space-x-4
    const diceContainer = container.querySelector('.flex.justify-center');
    expect(diceContainer).toHaveClass('space-x-4');

    // Check individual dice containers
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

  it('shows loading state when rolling', () => {
    const { container } = render(<DiceDisplay {...defaultProps} isRolling={true} />);
    const firstDie = container.querySelector('.animate-bounce');
    const secondDie = container.querySelector('.animate-bounce.delay-100');
    expect(firstDie).toBeInTheDocument();
    expect(secondDie).toBeInTheDocument();
  });

  it('maintains total sum visibility', () => {
    const { getByText } = render(<DiceDisplay {...defaultProps} />);
    const sum = getByText('Sum: 7');
    expect(sum).toHaveClass('text-xl', 'font-bold', 'dark:text-white');
  });
});