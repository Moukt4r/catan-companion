import React from 'react';
import { render, screen } from '@testing-library/react';
import { DiceDisplay } from '../DiceDisplay';
import { DiceRoll, SpecialDieFace } from '@/types/diceTypes';

const createRoll = (dice1: number, dice2: number, specialDie?: SpecialDieFace): DiceRoll => ({
  dice: [dice1, dice2],
  total: dice1 + dice2,
  specialDie: specialDie ?? null,
});

describe('DiceDisplay', () => {
  it('renders standard dice correctly', () => {
    const roll = createRoll(3, 4);
    render(<DiceDisplay roll={roll} isRolling={false} />);

    expect(screen.getByRole('img', { name: 'First die showing 3' })).toHaveTextContent('3');
    expect(screen.getByRole('img', { name: 'Second die showing 4' })).toHaveTextContent('4');
    expect(screen.getByText('Total: 7')).toBeInTheDocument();
  });

  it('renders all special die types correctly', () => {
    const specialDieTypes: SpecialDieFace[] = ['barbarian', 'merchant', 'politics', 'science'];

    specialDieTypes.forEach(specialDie => {
      const roll = createRoll(3, 4, specialDie);
      const { container } = render(<DiceDisplay roll={roll} isRolling={false} />);

      // Title case the special die name
      const titleCaseName = specialDie.charAt(0).toUpperCase() + specialDie.slice(1);
      const specialDieElement = container.querySelector(`[title="${titleCaseName} Die Face"]`);
      expect(specialDieElement).toBeInTheDocument();
      
      // Clean up between tests
      container.remove();
    });
  });

  it('applies animation classes when rolling', () => {
    const roll = createRoll(3, 4);
    const { container } = render(<DiceDisplay roll={roll} isRolling={true} />);

    const [firstDie, secondDie] = container.querySelectorAll('.animate-bounce');
    expect(firstDie).toBeInTheDocument();
    expect(secondDie).toBeInTheDocument();
    expect(secondDie).toHaveClass('delay-100');
  });

  it('handles dark mode classes', () => {
    const roll = createRoll(3, 4);
    render(<DiceDisplay roll={roll} isRolling={false} />);

    expect(screen.getByText('Total: 7')).toBeInTheDocument();
    const container = screen.getByText('Total: 7').parentElement;
    expect(container).toHaveClass('text-center dark:text-white');
  });

  it('correctly updates when roll values change', () => {
    const roll = createRoll(3, 4);
    const { rerender } = render(<DiceDisplay roll={roll} isRolling={false} />);

    // Check initial render
    expect(screen.getByRole('img', { name: 'First die showing 3' })).toHaveTextContent('3');
    expect(screen.getByRole('img', { name: 'Second die showing 4' })).toHaveTextContent('4');

    // Update props
    const newRoll = createRoll(5, 6);
    rerender(<DiceDisplay roll={newRoll} isRolling={false} />);

    // Check updated render
    expect(screen.getByRole('img', { name: 'First die showing 5' })).toHaveTextContent('5');
    expect(screen.getByRole('img', { name: 'Second die showing 6' })).toHaveTextContent('6');
    expect(screen.getByText('Total: 11')).toBeInTheDocument();
  });

  it('displays appropriate ARIA labels for accessibility', () => {
    const roll = createRoll(3, 4);
    render(<DiceDisplay roll={roll} isRolling={false} />);

    expect(screen.getByRole('img', { name: 'First die showing 3' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Second die showing 4' })).toBeInTheDocument();
  });

  it('displays special die with appropriate aria-live for dynamic updates', () => {
    const roll = createRoll(3, 4, 'barbarian');
    render(<DiceDisplay roll={roll} isRolling={false} />);

    const container = screen.getByRole('img', { name: 'First die showing 3' }).closest('div[aria-live]');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('handles undefined or invalid special die faces', () => {
    const roll = createRoll(3, 4);
    render(<DiceDisplay roll={roll} isRolling={false} />);

    expect(screen.queryByTitle(/Die Face/)).not.toBeInTheDocument();
  });

  it('maintains correct spacing and layout', () => {
    const roll = createRoll(3, 4, 'barbarian');
    const { container } = render(<DiceDisplay roll={roll} isRolling={false} />);

    // Check flex container classes
    expect(container.querySelector('.flex.flex-col')).toBeInTheDocument();
    expect(container.querySelector('.flex.justify-center.space-x-4')).toBeInTheDocument();
  });

  it('renders special die with correct colors', () => {
    const specialDieTypes: Array<[SpecialDieFace, string]> = [
      ['barbarian', 'bg-red-500'],
      ['merchant', 'bg-yellow-400'],
      ['politics', 'bg-blue-500'],
      ['science', 'bg-green-500']
    ];

    specialDieTypes.forEach(([type, colorClass]) => {
      const roll = createRoll(3, 4, type);
      const { container } = render(<DiceDisplay roll={roll} isRolling={false} />);

      const colorIndicator = container.querySelector(`.${colorClass}`);
      expect(colorIndicator).toBeInTheDocument();

      container.remove();
    });
  });
});