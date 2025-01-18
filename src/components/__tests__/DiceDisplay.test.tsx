import React from 'react';
import { render, screen } from '@testing-library/react';
import { DiceDisplay } from '../DiceDisplay';
import { DiceRoll, SpecialDieFace, SPECIAL_DIE_INFO } from '@/types/diceTypes';

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

      // Test special die info mapping
      const dieInfo = SPECIAL_DIE_INFO[specialDie];
      expect(container.querySelector(`.${dieInfo.color}`)).toBeInTheDocument();
      expect(container.textContent).toContain(dieInfo.icon);
      expect(container.textContent).toContain(dieInfo.label);
      
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

  it('handles null special die face', () => {
    const roll = createRoll(3, 4);
    roll.specialDie = null;
    render(<DiceDisplay roll={roll} isRolling={false} />);

    expect(screen.queryByTitle(/Die Face/)).not.toBeInTheDocument();
  });

  it('handles invalid special die face', () => {
    const roll = createRoll(3, 4);
    // @ts-ignore - Testing invalid input
    roll.specialDie = 'invalid';
    render(<DiceDisplay roll={roll} isRolling={false} />);

    expect(screen.queryByTitle(/Die Face/)).not.toBeInTheDocument();
  });

  it('handles undefined special die face', () => {
    const roll = createRoll(3, 4);
    // @ts-ignore - Testing undefined input
    roll.specialDie = undefined;
    render(<DiceDisplay roll={roll} isRolling={false} />);

    expect(screen.queryByTitle(/Die Face/)).not.toBeInTheDocument();
  });

  it('renders special die with correct colors and layout', () => {
    const specialDieTypes: Array<[SpecialDieFace, string, string, string]> = [
      ['barbarian', 'bg-red-500', '🗡️', 'Barbarian'],
      ['merchant', 'bg-yellow-400', '💰', 'Merchant'],
      ['politics', 'bg-blue-500', '👑', 'Politics'],
      ['science', 'bg-green-500', '🔬', 'Science']
    ];

    specialDieTypes.forEach(([type, colorClass, icon, label]) => {
      const roll = createRoll(3, 4, type);
      const { container } = render(<DiceDisplay roll={roll} isRolling={false} />);

      // Check color indicator
      const colorIndicator = container.querySelector(`.${colorClass}`);
      expect(colorIndicator).toBeInTheDocument();

      // Check icon and label
      expect(container.textContent).toContain(icon);
      expect(container.textContent).toContain(label);

      // Check flex layout
      const specialDieContainer = container.querySelector('.flex.items-center.gap-2.mt-2');
      expect(specialDieContainer).toBeInTheDocument();

      container.remove();
    });
  });

  it('maintains responsive layout', () => {
    const roll = createRoll(3, 4, 'barbarian');
    const { container } = render(<DiceDisplay roll={roll} isRolling={false} />);

    // Check main container
    expect(container.firstChild).toHaveClass('mt-6');

    // Check flex containers
    const flexCol = container.querySelector('.flex.flex-col');
    expect(flexCol).toHaveClass('items-center', 'justify-center', 'space-y-4');

    const flexRow = container.querySelector('.flex.justify-center');
    expect(flexRow).toHaveClass('space-x-4');

    // Check individual dice containers
    const diceContainers = container.querySelectorAll('.w-16.h-16');
    expect(diceContainers).toHaveLength(2);
    diceContainers.forEach(die => {
      expect(die).toHaveClass(
        'bg-white',
        'dark:bg-gray-700',
        'border-2',
        'border-gray-300',
        'dark:border-gray-600',
        'rounded-lg',
        'flex',
        'items-center',
        'justify-center',
        'text-2xl',
        'font-bold'
      );
    });
  });
});