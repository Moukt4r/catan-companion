import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarbarianTrack } from '../BarbarianTrack';
import type { BarbarianState } from '../../utils/barbarianTracker';

describe('BarbarianTrack', () => {
  const mockState: BarbarianState = {
    currentProgress: 3,
    maxProgress: 7,
    isAttacking: false,
    knights: 2,
    attackHistory: [],
    lastAction: undefined
  };

  const mockReset = jest.fn();
  const mockConfigureMax = jest.fn();

  beforeEach(() => {
    mockReset.mockClear();
    mockConfigureMax.mockClear();
  });

  it('renders current progress correctly', () => {
    render(
      <BarbarianTrack
        state={mockState}
        onReset={mockReset}
        onConfigureMax={mockConfigureMax}
      />
    );

    expect(screen.getByText('3 / 7')).toBeInTheDocument();
  });

  it('shows attack warning when attacking', () => {
    const attackingState = { ...mockState, isAttacking: true };
    render(
      <BarbarianTrack
        state={attackingState}
        onReset={mockReset}
        onConfigureMax={mockConfigureMax}
      />
    );

    expect(screen.getByText('Barbarians Attack!')).toBeInTheDocument();
  });

  it('calls reset when reset button clicked', () => {
    render(
      <BarbarianTrack
        state={mockState}
        onReset={mockReset}
        onConfigureMax={mockConfigureMax}
      />
    );

    const resetButton = screen.getByLabelText('Reset progress');
    fireEvent.click(resetButton);
    expect(mockReset).toHaveBeenCalled();
  });

  it('allows configuring max progress', () => {
    render(
      <BarbarianTrack
        state={mockState}
        onReset={mockReset}
        onConfigureMax={mockConfigureMax}
      />
    );

    // Open config
    const configButton = screen.getByLabelText('Configure settings');
    fireEvent.click(configButton);

    // Update max value
    const input = screen.getByLabelText('Maximum barbarian progress');
    fireEvent.change(input, { target: { value: '10' } });
    
    // Save changes
    const setButton = screen.getByText('Set Max');
    fireEvent.click(setButton);

    expect(mockConfigureMax).toHaveBeenCalledWith(10);
  });
});