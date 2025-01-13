import React from 'react';
import { render, screen } from '@testing-library/react';
import { SpecialDie } from '../SpecialDie';
import type { SpecialDieFace } from '../../types/diceTypes';

describe('SpecialDie', () => {
  const faces: SpecialDieFace[] = ['barbarian', 'merchant', 'politics', 'science', 'trade', 'none'];

  faces.forEach(face => {
    it(`renders ${face} face correctly`, () => {
      render(<SpecialDie face={face} />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', `Special die showing ${face}`);
    });
  });

  it('applies custom className', () => {
    render(<SpecialDie face="barbarian" className="test-class" />);
    expect(screen.getByRole('img')).toHaveClass('test-class');
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
      const { container } = render(<SpecialDie face={face} />);
      const dieElement = screen.getByRole('img');
      expect(dieElement).toHaveClass(colorMap[face]);
    });
  });

  it('renders correct icon for each face', () => {
    faces.forEach(face => {
      render(<SpecialDie face={face} />);
      // Check if the SVG icon is present
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});