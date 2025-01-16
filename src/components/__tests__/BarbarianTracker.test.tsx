import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BarbarianTracker } from '../BarbarianTracker';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Swords: () => <div data-testid="swords-icon" />,
  Settings: () => <div data-testid="settings-icon" />
}));

// Mock Audio
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockAudio = jest.fn(() => ({
  play: mockPlay
}));
(global as any).Audio = mockAudio;

describe('BarbarianTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<BarbarianTracker />);
    expect(screen.getByText('Barbarian Progress')).toBeInTheDocument();
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Advance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Knight' })).toBeInTheDocument();
  });

  it('advances progress when clicking advance button', () => {
    render(<BarbarianTracker threshold={7} />);
    
    // Test exact value (with approximate comparison)
    const advanceButton = screen.getByRole('button', { name: 'Advance' });
    fireEvent.click(advanceButton);
    
    const progressBar = document.querySelector('.bg-red-500') as HTMLElement;
    const width = parseFloat(progressBar.style.width);
    expect(width).toBeCloseTo(14.2857, 3); // 1/7 ≈ 14.2857%
  });

  it('adds knights when clicking add knight button', () => {
    render(<BarbarianTracker />);
    const addKnightButton = screen.getByRole('button', { name: 'Add Knight' });
    
    fireEvent.click(addKnightButton);
    expect(screen.getByText('Knights: 1')).toBeInTheDocument();
    
    fireEvent.click(addKnightButton);
    expect(screen.getByText('Knights: 2')).toBeInTheDocument();
  });

  it('shows settings panel when clicking settings button', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByTitle('Configure threshold');

    fireEvent.click(settingsButton);
    expect(screen.getByText('Attack Threshold (steps)')).toBeInTheDocument();
  });

  it('updates threshold via settings', () => {
    render(<BarbarianTracker />);
    
    // Open settings
    const settingsButton = screen.getByTitle('Configure threshold');
    fireEvent.click(settingsButton);

    // Update threshold
    const thresholdInput = screen.getByLabelText('Attack Threshold (steps)');
    fireEvent.change(thresholdInput, { target: { value: '5' } });

    // Verify new threshold
    const advanceButton = screen.getByRole('button', { name: 'Advance' });
    fireEvent.click(advanceButton);

    const progressBar = document.querySelector('.bg-red-500') as HTMLElement;
    const width = parseFloat(progressBar.style.width);
    expect(width).toBeCloseTo(20, 3); // 1/5 = 20%
  });

  it('ignores invalid threshold inputs', () => {
    render(<BarbarianTracker />);
    
    // Open settings
    const settingsButton = screen.getByTitle('Configure threshold');
    fireEvent.click(settingsButton);

    const thresholdInput = screen.getByLabelText('Attack Threshold (steps)');
    
    // Test negative value
    fireEvent.change(thresholdInput, { target: { value: '-1' } });
    expect(thresholdInput).toHaveValue(7); // Default value remains

    // Test non-numeric value
    fireEvent.change(thresholdInput, { target: { value: 'abc' } });
    expect(thresholdInput).toHaveValue(7);
  });

  it('triggers barbarian attack at threshold', () => {
    render(<BarbarianTracker threshold={3} />);
    const advanceButton = screen.getByRole('button', { name: 'Advance' });
    
    // Advance to threshold
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    // Should trigger attack
    expect(mockAudio).toHaveBeenCalledWith('/barbarian-attack.mp3');
    expect(mockPlay).toHaveBeenCalled();

    // Should show in attack history
    expect(screen.getByText('Failed!')).toBeInTheDocument();
  });

  it('handles successful defense', () => {
    render(<BarbarianTracker threshold={3} />);
    const addKnightButton = screen.getByRole('button', { name: 'Add Knight' });
    const advanceButton = screen.getByRole('button', { name: 'Advance' });

    // Add enough knights
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);

    // Trigger attack
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    // Should show successful defense
    expect(screen.getByText('Defended!')).toBeInTheDocument();
  });

  it('resets knights after attack', () => {
    render(<BarbarianTracker threshold={3} />);
    const addKnightButton = screen.getByRole('button', { name: 'Add Knight' });
    const advanceButton = screen.getByRole('button', { name: 'Advance' });

    // Add knights and trigger attack
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    // Knights should reset
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
  });

  it('allows controlling via ref', () => {
    const ref = React.createRef<any>();
    render(<BarbarianTracker ref={ref} threshold={5} />);

    act(() => {
      ref.current.advance();
    });

    const progressBar = document.querySelector('.bg-red-500') as HTMLElement;
    const width = parseFloat(progressBar.style.width);
    expect(width).toBeCloseTo(20, 3); // 1/5 = 20%
  });

  it('maintains attack history', () => {
    render(<BarbarianTracker threshold={3} />);
    const advanceButton = screen.getByRole('button', { name: 'Advance' });

    // Trigger multiple attacks
    for (let i = 0; i < 6; i++) {
      fireEvent.click(advanceButton);
    }

    // Should show attack history
    expect(screen.getByText('Attack History')).toBeInTheDocument();
    const failedAttacks = screen.getAllByText('Failed!');
    expect(failedAttacks.length).toBe(2); // Two complete attacks
  });

  it('displays progress bar correctly at max value', () => {
    render(<BarbarianTracker threshold={3} />);
    const advanceButton = screen.getByRole('button', { name: 'Advance' });

    // Advance twice (2/3 progress)
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);

    const progressBar = document.querySelector('.bg-red-500') as HTMLElement;
    const width = parseFloat(progressBar.style.width);
    expect(width).toBeCloseTo(66.6667, 3); // 2/3 ≈ 66.6667%
  });
});
