import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { BarbarianTracker } from '../BarbarianTracker';

// Mock Audio
const mockPlay = jest.fn().mockImplementation(() => Promise.resolve());
const mockAudio = jest.fn().mockImplementation(() => ({
  play: mockPlay
}));
(global as any).Audio = mockAudio;

describe('BarbarianTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<BarbarianTracker />);
    expect(screen.getByText('Barbarian Progress')).toBeInTheDocument();
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
  });

  it('advances progress when clicking advance button', () => {
    render(<BarbarianTracker threshold={7} />);
    const advanceButton = screen.getByText('Advance');

    fireEvent.click(advanceButton);
    // Progress bar width should be about 14% (1/7)
    const progressBar = document.querySelector('.bg-red-500');
    expect(progressBar).toHaveStyle({ width: '14.285714285714286%' });
  });

  it('adds knights when clicking add knight button', () => {
    render(<BarbarianTracker />);
    const addKnightButton = screen.getByText('Add Knight');

    fireEvent.click(addKnightButton);
    expect(screen.getByText('Knights: 1')).toBeInTheDocument();

    fireEvent.click(addKnightButton);
    expect(screen.getByText('Knights: 2')).toBeInTheDocument();
  });

  it('triggers barbarian attack when progress reaches threshold with success', () => {
    render(<BarbarianTracker threshold={3} />);
    const addKnightButton = screen.getByText('Add Knight');
    const advanceButton = screen.getByText('Advance');

    // Add enough knights to succeed
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton); // 3 knights

    // Advance to threshold
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    expect(screen.getByText('Defended!')).toBeInTheDocument();
    expect(mockAudio).toHaveBeenCalledWith('/barbarian-attack.mp3');
    expect(mockPlay).toHaveBeenCalled();
  });

  it('triggers barbarian attack when progress reaches threshold with failure', () => {
    render(<BarbarianTracker threshold={3} />);
    const advanceButton = screen.getByText('Advance');

    // Advance to threshold with no knights
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    expect(screen.getByText('Failed!')).toBeInTheDocument();
  });

  it('handles audio play failure gracefully', () => {
    mockPlay.mockRejectedValueOnce(new Error('Audio failed'));
    render(<BarbarianTracker threshold={3} />);
    const advanceButton = screen.getByText('Advance');

    // Advance to threshold
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    // Should not throw error
    expect(screen.getByText('Failed!')).toBeInTheDocument();
  });

  it('shows settings panel when clicking settings button', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByTitle('Configure threshold');

    fireEvent.click(settingsButton);
    expect(screen.getByLabelText('Attack Threshold (steps)')).toBeInTheDocument();
  });

  it('updates threshold via settings', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByTitle('Configure threshold');

    fireEvent.click(settingsButton);
    const thresholdInput = screen.getByLabelText('Attack Threshold (steps)');
    fireEvent.change(thresholdInput, { target: { value: '5' } });

    const advanceButton = screen.getByText('Advance');
    fireEvent.click(advanceButton);

    // Progress bar width should be about 20% (1/5)
    const progressBar = document.querySelector('.bg-red-500');
    expect(progressBar).toHaveStyle({ width: '20%' });
  });

  it('ignores invalid threshold inputs', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByTitle('Configure threshold');

    fireEvent.click(settingsButton);
    const thresholdInput = screen.getByLabelText('Attack Threshold (steps)');
    
    // Try invalid values
    fireEvent.change(thresholdInput, { target: { value: '-1' } });
    fireEvent.change(thresholdInput, { target: { value: 'abc' } });

    // Should maintain previous valid value
    expect(thresholdInput).toHaveValue(7);
  });

  it('allows controlling via ref', () => {
    const ref = React.createRef<any>();
    render(<BarbarianTracker ref={ref} threshold={5} />);

    // Use ref to advance
    ref.current.advance();

    // Progress bar width should be about 20% (1/5)
    const progressBar = document.querySelector('.bg-red-500');
    expect(progressBar).toHaveStyle({ width: '20%' });
  });

  it('maintains attack history', () => {
    render(<BarbarianTracker threshold={3} />);
    const advanceButton = screen.getByText('Advance');
    const addKnightButton = screen.getByText('Add Knight');

    // First attack - fail
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    expect(screen.getByText('Failed!')).toBeInTheDocument();

    // Second attack - succeed
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    // Should show both attacks in history
    const attacks = screen.getAllByText(/Failed!|Defended!/);
    expect(attacks).toHaveLength(2);
    expect(attacks[0].textContent).toBe('Defended!');
    expect(attacks[1].textContent).toBe('Failed!');
  });

  it('resets knights after an attack', () => {
    render(<BarbarianTracker threshold={3} />);
    const advanceButton = screen.getByText('Advance');
    const addKnightButton = screen.getByText('Add Knight');

    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    expect(screen.getByText('Knights: 2')).toBeInTheDocument();

    // Trigger attack
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    // Knights should reset
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
  });
});