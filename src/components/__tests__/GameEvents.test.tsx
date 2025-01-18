import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameEvents, GameEventsRef } from '../GameEvents';

const mockEvents = [
  { id: 1, type: 'positive', description: 'Good event!' },
  { id: 2, type: 'negative', description: 'Bad event!' },
  { id: 3, type: 'neutral', description: 'Neutral event!' }
];

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('GameEvents', () => {
  let ref: React.RefObject<GameEventsRef>;

  beforeEach(() => {
    ref = React.createRef<GameEventsRef>();
    jest.spyOn(Math, 'random').mockImplementation(() => 0.1); // Below the default 0.15 threshold
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without initial event', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    expect(screen.getByText(/chance to trigger/i)).toBeInTheDocument();
  });

  it('renders with initial event', () => {
    render(<GameEvents ref={ref} events={mockEvents} initialEvent={mockEvents[0]} />);
    expect(screen.getByTestId('current-event')).toBeInTheDocument();
    expect(screen.getByTestId('current-event-text-positive')).toHaveTextContent('Good event!');
  });

  it('triggers events when chance is met', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('current-event')).toBeInTheDocument();
  });

  it('auto-dismisses events after timeout', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('current-event')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();
  });

  it('clears previous timeout when new event triggers', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    render(<GameEvents ref={ref} events={mockEvents} />);

    // Trigger first event
    act(() => {
      ref.current?.checkForEvent();
    });

    // Trigger second event before timeout
    act(() => {
      ref.current?.checkForEvent();
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('shows and hides settings panel', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    const settingsButton = screen.getByTitle('Configure events');
    
    // Show settings
    fireEvent.click(settingsButton);
    expect(screen.getByLabelText('Enable random events')).toBeInTheDocument();
    
    // Hide settings
    fireEvent.click(settingsButton);
    expect(screen.queryByLabelText('Enable random events')).not.toBeInTheDocument();
  });

  it('toggles events enable/disable', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    
    // Show settings
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Disable events
    const enableCheckbox = screen.getByLabelText('Enable random events');
    fireEvent.click(enableCheckbox);
    
    // Try to trigger event
    act(() => {
      ref.current?.checkForEvent();
    });
    
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();
  });

  it('adjusts event chance', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    
    // Show settings
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Change event chance
    const chanceInput = screen.getByLabelText('Event Chance (0-100%)');
    fireEvent.change(chanceInput, { target: { value: '50' } });
    
    expect(screen.getByText(/50% chance to trigger/)).toBeInTheDocument();
  });

  it('handles event history', () => {
    render(<GameEvents ref={ref} events={mockEvents} initialEvent={mockEvents[0]} />);
    
    // Initial event should be in history
    const historyButton = screen.getByText('Show History');
    fireEvent.click(historyButton);
    
    expect(screen.getByTestId('event-history')).toBeInTheDocument();
    expect(screen.getByTestId('history-event-positive-0')).toHaveTextContent('Good event!');
    
    // Hide history
    fireEvent.click(screen.getByText('Hide History'));
    expect(screen.queryByTestId('event-history')).not.toBeInTheDocument();
  });

  it('handles different event types icons', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    
    // Trigger multiple events of different types
    jest.spyOn(Math, 'random')
      .mockImplementationOnce(() => 0.1)  // positive
      .mockImplementationOnce(() => 0.1)  // negative
      .mockImplementationOnce(() => 0.1); // neutral
    
    // Trigger positive event
    act(() => {
      ref.current?.checkForEvent();
      ref.current?.checkForEvent();
      ref.current?.checkForEvent();
    });

    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
  });

  it('handles edge cases for event triggering', () => {
    render(<GameEvents ref={ref} events={[]} />);
    
    // Try to trigger event with no events
    act(() => {
      ref.current?.checkForEvent();
    });
    
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();
  });

  it('handles chance input validation', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    
    // Show settings
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Test invalid chance values
    const chanceInput = screen.getByLabelText('Event Chance (0-100%)');
    
    // Test negative value
    fireEvent.change(chanceInput, { target: { value: '-10' } });
    expect(screen.getByText(/0% chance to trigger/)).toBeInTheDocument();
    
    // Test value > 100
    fireEvent.change(chanceInput, { target: { value: '150' } });
    expect(screen.getByText(/100% chance to trigger/)).toBeInTheDocument();
  });

  it('properly handles event queue and timeouts', () => {
    render(<GameEvents ref={ref} events={mockEvents} />);
    
    // Trigger first event
    act(() => {
      ref.current?.checkForEvent();
    });
    
    const firstEvent = screen.getByTestId('current-event-text-positive');
    expect(firstEvent).toBeInTheDocument();
    
    // Fast-forward halfway through timeout
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Trigger second event
    act(() => {
      ref.current?.checkForEvent();
    });
    
    // Original timer should be cleared and new timer started
    act(() => {
      jest.advanceTimersByTime(5000); // This shouldn't dismiss the second event
    });
    expect(screen.getByTestId('current-event')).toBeInTheDocument();
    
    // Full timeout for second event
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();
  });
});