import React from 'react';
import { render, screen } from '@testing-library/react';
import { DiceDisplay } from '../DiceDisplay';
import type { DiceRoll } from '@/types/diceTypes';

describe('DiceDisplay', () => {
  const mockRoll: DiceRoll = {
    dice1: 3,
    dice2: 4,
    sum: 7
  };

  it('renders standard dice correctly', () => {
    render(<DiceDisplay roll={mockRoll} isRolling={false} />);
    
    expect(screen.getByLabelText(/First die showing 3/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Second die showing 4/i)).toBeInTheDocument();
    expect(screen.getByText('Sum: 7')).toBeInTheDocument();
  });

  it('renders all special die types correctly', () => {
    const specialDieTypes = ['barbarian', 'merchant', 'politics', 'science'] as const;

    for (const specialDie of specialDieTypes) {
      const rollWithSpecial: DiceRoll = {
        ...mockRoll,
        specialDie
      };

      const { rerender } = render(<DiceDisplay roll={rollWithSpecial} isRolling={false} />);
      
      // Check for the special die color, icon, and label
      const specialDieSection = screen.getByTitle(`${specialDie} Die Face`);
      expect(specialDieSection).toBeInTheDocument();

      // Check for specific color classes based on die type
      const colorIndicator = specialDieSection.querySelector('span');
      switch(specialDie) {
        case 'barbarian':
          expect(colorIndicator).toHaveClass('bg-red-500');
          break;
        case 'merchant':
          expect(colorIndicator).toHaveClass('bg-yellow-400');
          break;
        case 'politics':
          expect(colorIndicator).toHaveClass('bg-blue-500');
          break;
        case 'science':
          expect(colorIndicator).toHaveClass('bg-green-500');
          break;
      }

      rerender(<DiceDisplay roll={mockRoll} isRolling={false} />);
    }
  });

  it('applies animation classes when rolling', () => {
    render(<DiceDisplay roll={mockRoll} isRolling={true} />);
    
    const firstDie = screen.getByLabelText(/First die showing/i);
    const secondDie = screen.getByLabelText(/Second die showing/i);
    
    expect(firstDie).toHaveClass('animate-bounce');
    expect(secondDie).toHaveClass('animate-bounce', 'delay-100');
  });

  it('handles dark mode classes', () => {
    render(<DiceDisplay roll={mockRoll} isRolling={false} />);

    const dice = screen.getAllByRole('img');
    dice.forEach(die => {
      expect(die).toHaveClass('dark:bg-gray-700', 'dark:border-gray-600');
    });
  });

  it('correctly updates when roll values change', () => {
    const { rerender } = render(<DiceDisplay roll={mockRoll} isRolling={false} />);
    
    const newRoll: DiceRoll = {
      dice1: 5,
      dice2: 6,
      sum: 11
    };

    rerender(<DiceDisplay roll={newRoll} isRolling={false} />);
    
    expect(screen.getByLabelText(/First die showing 5/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Second die showing 6/i)).toBeInTheDocument();
    expect(screen.getByText('Sum: 11')).toBeInTheDocument();
  });

  it('displays appropriate ARIA labels for accessibility', () => {
    render(<DiceDisplay roll={mockRoll} isRolling={false} />);
    
    expect(screen.getByRole('img', { name: /First die showing 3/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Second die showing 4/i })).toBeInTheDocument();
  });

  it('displays special die with appropriate aria-live for dynamic updates', () => {
    const rollWithSpecial: DiceRoll = {
      ...mockRoll,
      specialDie: 'barbarian'
    };

    render(<DiceDisplay roll={rollWithSpecial} isRolling={false} />);
    
    const container = screen.getByText(/Sum: /i).parentElement;
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});