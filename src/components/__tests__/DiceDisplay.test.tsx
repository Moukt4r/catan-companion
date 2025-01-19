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

  it('renders animation class when rolling', () => {
    const { container } = render(
      <DiceDisplay roll={defaultRoll} isRolling={true} />
    );
    const diceElements = container.querySelectorAll('.animate-bounce');
    expect(diceElements).toHaveLength(2);
  });

  it('renders special die correctly for all face types', () => {
    const faceTypes = ['barbarian', 'merchant', 'politics', 'science'] as const;
    
    faceTypes.forEach(face => {
      const rollWithFace: DiceRoll = {
        ...defaultRoll,
        specialDie: face
      };

      const { container } = render(
        <DiceDisplay roll={rollWithFace} isRolling={false} />
      );

      const faceInfo = SPECIAL_DIE_INFO[face];
      const colorClass = faceInfo.color.split(' ')[0];

      const wrapper = container.querySelector('.flex.items-center.gap-2.mt-2');
      expect(wrapper).toBeInTheDocument();

      const colorDot = wrapper?.querySelector(`.${colorClass}`);
      expect(colorDot).toBeInTheDocument();
      expect(wrapper?.textContent).toContain(faceInfo.icon);
      expect(wrapper?.textContent).toContain(faceInfo.label);
      
      const title = wrapper?.getAttribute('title');
      expect(title).toBe(`${faceInfo.label} Die Face`);
    });
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

    const diceContainer = container.querySelector('.flex.flex-col');
    expect(diceContainer).toBeInTheDocument();
    expect(diceContainer).toHaveClass('items-center', 'justify-center', 'space-y-4');

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

  // Edge case tests
  it('handles missing special die face', () => {
    const roll = { ...defaultRoll, specialDie: undefined };
    const { container } = render(<DiceDisplay roll={roll} />);
    
    const specialDie = container.querySelector('.flex.items-center.gap-2.mt-2');
    expect(specialDie).not.toBeInTheDocument();
  });

  it('handles invalid special die face', () => {
    const roll = { ...defaultRoll, specialDie: 'invalid-face' as any };
    const { container } = render(<DiceDisplay roll={roll} />);
    
    const specialDie = container.querySelector('.flex.items-center.gap-2.mt-2');
    expect(specialDie).not.toBeInTheDocument();
  });

  it('handles missing special die info', () => {
    const originalInfo = { ...SPECIAL_DIE_INFO };
    (SPECIAL_DIE_INFO as any).barbarian = undefined;

    const roll = { ...defaultRoll, specialDie: 'barbarian' };
    const { container } = render(<DiceDisplay roll={roll} />);
    
    const specialDie = container.querySelector('.flex.items-center.gap-2.mt-2');
    expect(specialDie).not.toBeInTheDocument();

    Object.assign(SPECIAL_DIE_INFO, originalInfo);
  });

  it('handles empty special die face', () => {
    const roll = { ...defaultRoll, specialDie: '' as any };
    const { container } = render(<DiceDisplay roll={roll} />);
    
    const specialDie = container.querySelector('.flex.items-center.gap-2.mt-2');
    expect(specialDie).not.toBeInTheDocument();
  });
});