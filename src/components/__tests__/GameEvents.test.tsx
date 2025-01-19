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
  let randomSpy: jest.SpyInstance;

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1); // 10% chance, below default 15%
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
    const historyItems = screen.getAllByTestId(/success-icon|warning-icon|neutral-icon/);
    expect(historyItems).toHaveLength(10);
  });

  it('shows correct style for each event type', () => {
    render(<GameEvents ref={ref} />);
    
    // Test positive event (first 10 events)
    randomSpy
      .mockReturnValueOnce(0.1)  // For event trigger check
      .mockReturnValueOnce(0.1); // For event selection (0-0.33 = positive)
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    let event = screen.getByTestId('current-event');
    expect(event).toHaveClass('bg-green-50', 'border-green-500');

    // Clear current event
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Test negative event (events 10-19)
    randomSpy
      .mockReturnValueOnce(0.1)  // For event trigger check
      .mockReturnValueOnce(0.5); // For event selection (0.34-0.66 = negative)
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    event = screen.getByTestId('current-event');
    expect(event).toHaveClass('bg-red-50', 'border-red-500');

    // Clear current event
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Test neutral event (events 20-29)
    randomSpy
      .mockReturnValueOnce(0.1)  // For event trigger check
      .mockReturnValueOnce(0.8); // For event selection (0.67-1.0 = neutral)
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('neutral-icon')).toBeInTheDocument();
    event = screen.getByTestId('current-event');
    expect(event).toHaveClass('bg-blue-50', 'border-blue-500');
  });

  it('handles extreme event chance values', () => {
    render(<GameEvents ref={ref} />);
    fireEvent.click(screen.getByTitle('Configure events'));
    const input = screen.getByLabelText(/Event Chance/i);

    // Test values over 100%
    fireEvent.change(input, { target: { value: '150' } });
    expect(input).toHaveValue(100);
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('current-event')).toBeInTheDocument();

    // Test negative values
    fireEvent.change(input, { target: { value: '-10' } });
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

  it('shows appropriate event text based on type', () => {
    render(<GameEvents ref={ref} />);
    
    // Test positive event
    randomSpy
      .mockReturnValueOnce(0.1)  // For event trigger
      .mockReturnValueOnce(0.1); // For selection (first event)
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('current-event-text-positive')).toBeInTheDocument();
  });
});