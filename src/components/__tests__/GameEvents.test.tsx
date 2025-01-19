import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameEvents, GameEventsRef } from '../GameEvents';

// Mock the icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="neutral-icon">AlertCircle</div>,
  AlertTriangle: () => <div data-testid="negative-icon">AlertTriangle</div>,
  CheckCircle2: () => <div data-testid="positive-icon">CheckCircle2</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
}));

// Mock setTimeout
jest.useFakeTimers();

describe('GameEvents', () => {
  const ref = React.createRef<GameEventsRef>();
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random');
    randomSpy.mockReturnValue(0.1); // 10% chance, below default 15%
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.clearAllTimers();
    jest.clearAllMocks();
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
    render(<GameEvents ref={ref} />);
    
    // Trigger 12 events
    for (let i = 0; i < 12; i++) {
      act(() => {
        ref.current?.checkForEvent();
        jest.advanceTimersByTime(10000); // Clear current event
      });
    }
    
    fireEvent.click(screen.getByTestId('toggle-history'));
    const historyItems = screen.getAllByTestId(/positive-icon|negative-icon|neutral-icon/);
    expect(historyItems).toHaveLength(10);
  });

  it('shows correct icon and styling for each event type', () => {
    const { rerender } = render(<GameEvents ref={ref} />);

    // Test positive event
    jest.spyOn(global.Math, 'floor').mockReturnValueOnce(0); // First event in EVENTS array is positive
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('positive-icon')).toBeInTheDocument();
    expect(screen.getByTestId('current-event')).toHaveClass('bg-green-50');
    expect(screen.getByTestId('current-event-text-positive')).toBeInTheDocument();

    // Test negative event
    jest.spyOn(global.Math, 'floor').mockReturnValueOnce(10); // 11th event is negative
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('negative-icon')).toBeInTheDocument();
    expect(screen.getByTestId('current-event')).toHaveClass('bg-red-50');
    expect(screen.getByTestId('current-event-text-negative')).toBeInTheDocument();

    // Test neutral event
    jest.spyOn(global.Math, 'floor').mockReturnValueOnce(20); // 21st event is neutral
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('neutral-icon')).toBeInTheDocument();
    expect(screen.getByTestId('current-event')).toHaveClass('bg-blue-50');
    expect(screen.getByTestId('current-event-text-neutral')).toBeInTheDocument();
  });

  it('handles extreme event chance values', () => {
    render(<GameEvents ref={ref} />);
    fireEvent.click(screen.getByTitle('Configure events'));
    const input = screen.getByLabelText(/Event Chance/i);

    // Wait for any existing events to be dismissed
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Test with value > 100
    randomSpy.mockReturnValue(0.9); // Make sure no event triggers
    act(() => {
      fireEvent.change(input, { target: { value: '150' } });
    });
    expect(input).toHaveValue(100);
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();

    // Test with negative value
    act(() => {
      fireEvent.change(input, { target: { value: '-10' } });
    });
    expect(input).toHaveValue(0);
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();
  });

  it('does not trigger event when chance is not met', () => {
    randomSpy.mockReturnValueOnce(0.9); // Above threshold
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

  it('shows correct percentage text when no events are active', () => {
    render(<GameEvents ref={ref} />);
    expect(screen.getByText(/15% chance to trigger/)).toBeInTheDocument();

    // Change event chance
    fireEvent.click(screen.getByTitle('Configure events'));
    const input = screen.getByLabelText(/Event Chance/i);
    fireEvent.change(input, { target: { value: '25' } });

    expect(screen.getByText(/25% chance to trigger/)).toBeInTheDocument();
  });

  it('does not show percentage text when events are disabled', () => {
    render(<GameEvents ref={ref} />);
    fireEvent.click(screen.getByTitle('Configure events'));
    const toggle = screen.getByLabelText(/Enable random events/i);
    fireEvent.click(toggle);

    expect(screen.queryByText(/chance to trigger/)).not.toBeInTheDocument();
  });
});