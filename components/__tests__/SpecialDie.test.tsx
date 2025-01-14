import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { SpecialDie } from '../SpecialDie';
import type { SpecialDieFace } from '../../types/diceTypes';

describe('SpecialDie', () => {
  const faces: SpecialDieFace[] = ['barbarian', 'merchant', 'politics', 'science', 'trade', 'none'];

  afterEach(() => {
    cleanup();
  });

  it('applies custom className', () => {
    render(<SpecialDie face="barbarian" className="test-class" />);
    const dieElement = screen.getByTestId('special-die');
    expect(dieElement).toHaveClass('test-class');
  });

  it('has correct background color for each face', () => {
    const colorMap = {
      barbarian: 'bg-red-600',
      merchant: 'bg-yellow-600',
      politics: 'bg-green-600',
      science: 'bg-blue-600',
      trade: 'bg-purple-600',
      none: 'bg-gray-400'
    };

    faces.forEach(face => {
      render(<SpecialDie face={face} />);
      const dieElement = screen.getByTestId('special-die');
      expect(dieElement).toHaveClass(colorMap[face]);
      cleanup();
    });
  });

  it('renders correct icon for each face', () => {
    faces.forEach(face => {
      render(<SpecialDie face={face} />);
      const icon = screen.getByTestId(`${face}-icon`);
      expect(icon).toBeInTheDocument();
      cleanup();
    });
  });

  it('includes correct aria-label', () => {
    faces.forEach(face => {
      render(<SpecialDie face={face} />);
      const dieElement = screen.getByTestId('special-die');
      expect(dieElement).toHaveAttribute('aria-label', `Special die showing ${face}`);
      cleanup();
    });
  });
});