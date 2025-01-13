import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarbarianTrack } from '../BarbarianTrack';
import type { BarbarianState } from '../../utils/barbarianTracker';

const mockState: BarbarianState = {
  currentProgress: 3,
  maxProgress: 7,
  isAttacking: false,
  knights: 2,
  attackHistory: [],
  lastAction: {
    type: 'advance',
    previousState: {
      currentProgress: 2,
      maxProgress: 7,
      isAttacking: false,
      knights: 2,
      attackHistory: []
    }
  }
};

describe('BarbarianTrack', () => {
  const mockProps = {
    state: mockState,
    onReset: jest.fn(),
    onUndo: jest.fn(),
    onConfigureMax: jest.fn(),
    onSetKnights: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('keyboard navigation', () => {
    it('handles left arrow for undo', () => {
      render(<BarbarianTrack {...mockProps} />);
      const track = screen.getByRole('region');
      
      fireEvent.keyDown(track, { key: 'ArrowLeft' });
      expect(mockProps.onUndo).toHaveBeenCalled();
    });

    it('handles R key for reset', () => {
      render(<BarbarianTrack {...mockProps} />);
      const track = screen.getByRole('region');
      
      fireEvent.keyDown(track, { key: 'r' });
      expect(mockProps.onReset).toHaveBeenCalled();
    });

    it('does not allow undo when no previous action', () => {
      const stateWithoutAction = { ...mockState, lastAction: undefined };
      render(<BarbarianTrack {...mockProps} state={stateWithoutAction} />);
      
      const track = screen.getByRole('region');
      fireEvent.keyDown(track, { key: 'ArrowLeft' });
      expect(mockProps.onUndo).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('provides correct aria attributes', () => {
      render(<BarbarianTrack {...mockProps} />);
      
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '7');
      expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    });

    it('handles tab navigation correctly', () => {
      render(<BarbarianTrack {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('visual feedback', () => {
    it('shows attack animation when attacking', () => {
      const attackingState = { ...mockState, isAttacking: true };
      render(<BarbarianTrack {...mockProps} state={attackingState} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('animate-pulse');
    });

    it('uses high contrast colors for progress bar', () => {
      render(<BarbarianTrack {...mockProps} />);
      
      const progressBar = screen.getByRole('progressbar')
        .querySelector('div:nth-child(1)');
      expect(progressBar).toHaveClass('bg-amber-600');
    });
  });
});