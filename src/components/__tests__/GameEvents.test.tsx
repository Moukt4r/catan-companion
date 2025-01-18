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

// Mock setTimeout
jest.useFakeTimers();

describe('GameEvents', () => {
  const ref = React.createRef<GameEventsRef>();

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockImplementation(() => 0.1); // 10% chance, below default 15%
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

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
    expect(screen.getByTestId('current-event')).toBeInTheDocument();
  });

  it('shows settings when clicked', () => {
    render(<GameEvents ref={ref} />);
    fireEvent.click(screen.getByTitle('Configure events'));
    expect(screen.getByLabelText(/Enable random events/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Chance/i)).toBeInTheDocument();
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

  it('auto-dismisses events after timeout', () => {
    render(<GameEvents ref={ref} />);
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('current-event')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();
  });

  it('adds events to history', () => {
    render(<GameEvents ref={ref} />);
    act(() => {
      ref.current?.checkForEvent();
    });
    
    const toggleHistory = screen.getByTestId('toggle-history');
    fireEvent.click(toggleHistory);
    
    expect(screen.getByTestId('event-history')).toBeInTheDocument();
  });

  it('limits event history to 10 items', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 0.1); // Ensure events trigger
    render(<GameEvents ref={ref} />);
    
    // Trigger 12 events
    for (let i = 0; i < 12; i++) {
      act(() => {
        ref.current?.checkForEvent();
        jest.advanceTimersByTime(10000); // Clear current event
      });
    }
    
    fireEvent.click(screen.getByTestId('toggle-history'));
    const historyItems = screen.getAllByTestId(/-(neutral|warning|success)-icon/);
    expect(historyItems).toHaveLength(10);
  });

  it('shows correct icon for each event type', () => {
    jest.spyOn(Math, 'random')
      .mockImplementationOnce(() => 0.1) // Trigger event
      .mockImplementationOnce(() => 0.5); // No event
    
    render(<GameEvents ref={ref} />);
    act(() => {
      ref.current?.checkForEvent();
    });

    // Check icon based on event type
    const event = screen.getByTestId('current-event');
    const positiveIcon = event.querySelector('[data-testid="success-icon"]');
    const negativeIcon = event.querySelector('[data-testid="warning-icon"]');
    const neutralIcon = event.querySelector('[data-testid="neutral-icon"]');
    
    expect([positiveIcon, negativeIcon, neutralIcon].filter(Boolean)).toHaveLength(1);
  });

  it('handles extreme event chance values', () => {
    render(<GameEvents ref={ref} />);
    fireEvent.click(screen.getByTitle('Configure events'));
    const input = screen.getByLabelText(/Event Chance/i);

    // Test with value > 100
    fireEvent.change(input, { target: { value: '150' } });
    expect(input).toHaveValue(100);

    // Test with negative value
    fireEvent.change(input, { target: { value: '-10' } });
    expect(input).toHaveValue(0);
  });

  it('does not trigger event when chance is not met', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 0.9); // Above threshold
    render(<GameEvents ref={ref} />);
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();
  });

  it('toggles history visibility correctly', () => {
    render(<GameEvents ref={ref} />);
    act(() => {
      ref.current?.checkForEvent();
    });
    
    const toggleHistory = screen.getByTestId('toggle-history');
    fireEvent.click(toggleHistory);
    expect(screen.getByTestId('event-history')).toBeInTheDocument();
    
    fireEvent.click(toggleHistory);
    expect(screen.queryByTestId('event-history')).not.toBeInTheDocument();
  });
});