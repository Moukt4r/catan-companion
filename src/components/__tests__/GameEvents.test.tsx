import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameEvents, GameEventsRef } from '../GameEvents';

// Mock the icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="neutral-icon">AlertCircle</div>,
  AlertTriangle: () => <div data-testid="warning-icon">AlertTriangle</div>,
  CheckCircle2: () => <div data-testid="success-icon">CheckCircle2</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
}));

// Mock random to control event triggering
const mockRandom = jest.spyOn(Math, 'random');
mockRandom.mockImplementation(() => 0.1); // 10% chance, which is below the default 15%

describe('GameEvents', () => {
  const ref = React.createRef<GameEventsRef>();

  it('renders with defaults', () => {
    render(<GameEvents ref={ref} />);
    expect(screen.getByText(/chance to trigger/i)).toBeInTheDocument();
    expect(screen.queryByText(/Event!/)).not.toBeInTheDocument();
  });

  it('triggers events when chance is met', () => {
    render(<GameEvents ref={ref} />);
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByText(/Event!/)).toBeInTheDocument();
  });

  it('shows settings when clicked', () => {
    render(<GameEvents ref={ref} />);
    fireEvent.click(screen.getByTitle('Configure events'));
    expect(screen.getByLabelText(/Enable random events/i)).toBeInTheDocument();
  });

  it('allows toggling events on/off', () => {
    render(<GameEvents ref={ref} />);
    fireEvent.click(screen.getByTitle('Configure events'));
    const toggle = screen.getByLabelText(/Enable random events/i);
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.queryByText(/Event!/)).not.toBeInTheDocument();
  });

  it('allows changing event chance', () => {
    render(<GameEvents ref={ref} />);
    fireEvent.click(screen.getByTitle('Configure events'));
    const input = screen.getByLabelText(/Event Chance/i);
    fireEvent.change(input, { target: { value: '50' } });
    expect(input).toHaveValue(50);
  });
});