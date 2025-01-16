import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameEvents, GameEventsRef } from '../GameEvents';

// Mock the setTimeout and clearTimeout functions
jest.useFakeTimers();

describe('GameEvents', () => {
  // Mock data for testing
  const mockEvent = {
    id: 1,
    type: 'positive' as const,
    description: 'Test event description'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('renders initial state correctly', () => {
    render(<GameEvents />);
    
    // Check component title
    expect(screen.getByText('Game Events')).toBeInTheDocument();
    
    // Check settings button exists
    expect(screen.getByTitle('Configure events')).toBeInTheDocument();
    
    // Check initial text is shown
    expect(screen.getByText(/chance to trigger a random event/i)).toBeInTheDocument();
  });

  it('shows settings panel when clicked', () => {
    render(<GameEvents />);
    
    // Click settings button
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Check settings panel elements
    expect(screen.getByText('Enable random events')).toBeInTheDocument();
    expect(screen.getByText('Event Chance (0-100%)')).toBeInTheDocument();
    
    // Check inputs
    const checkbox = screen.getByRole('checkbox', { name: /enable random events/i });
    expect(checkbox).toBeChecked();
    
    const chanceInput = screen.getByRole('spinbutton');
    expect(chanceInput).toHaveValue(15); // Default 15%
  });

  it('handles event triggering correctly', () => {
    const ref = React.createRef<GameEventsRef>();
    render(<GameEvents ref={ref} />);
    
    // Force an event to trigger (mock Math.random)
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.1); // Below default 15% threshold
    
    // Trigger event check
    act(() => {
      ref.current?.checkForEvent();
    });
    
    // Verify event is displayed
    expect(screen.getByText(/event!/i)).toBeInTheDocument();
    
    // Clean up
    mockRandom.mockRestore();
  });

  it('updates event chance correctly', () => {
    render(<GameEvents />);
    
    // Open settings
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Change event chance
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '25' } });
    
    // Check if the text updates
    expect(screen.getByText(/25% chance to trigger/i)).toBeInTheDocument();
  });

  it('handles event disabling', () => {
    render(<GameEvents />);
    
    // Open settings
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Disable events
    const checkbox = screen.getByRole('checkbox', { name: /enable random events/i });
    fireEvent.click(checkbox);
    
    // Check if checkbox is unchecked
    expect(checkbox).not.toBeChecked();
  });

  it('auto-dismisses events after timeout', () => {
    const ref = React.createRef<GameEventsRef>();
    render(<GameEvents ref={ref} />);
    
    // Trigger event
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.1);
    
    act(() => {
      ref.current?.checkForEvent();
    });
    
    // Verify event is shown
    expect(screen.getByText(/event!/i)).toBeInTheDocument();
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Verify event is dismissed
    expect(screen.queryByText(/event!/i)).not.toBeInTheDocument();
    
    // Clean up
    mockRandom.mockRestore();
  });

  it('maintains event history', () => {
    const ref = React.createRef<GameEventsRef>();
    render(<GameEvents ref={ref} />);
    
    // Trigger multiple events
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.1);
    
    act(() => {
      ref.current?.checkForEvent();
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent();
    });
    
    // Show history
    const historyButton = screen.getByRole('button', { name: /show history/i });
    fireEvent.click(historyButton);
    
    // Verify events are in history
    const historyItems = screen.getAllByText(/event!/i);
    expect(historyItems.length).toBeGreaterThan(0);
    
    // Clean up
    mockRandom.mockRestore();
  });

  it('handles different event types', () => {
    const ref = React.createRef<GameEventsRef>();
    render(<GameEvents ref={ref} />);
    
    // Test positive event
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(0) // Select first event (positive)
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(0.5) // Select middle event (neutral)
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(0.9); // Select last event (negative)
    
    // Trigger events
    act(() => {
      ref.current?.checkForEvent(); // Positive
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent(); // Neutral
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent(); // Negative
    });
    
    // Show history
    fireEvent.click(screen.getByRole('button', { name: /show history/i }));
    
    // Verify different event types are shown
    expect(screen.getAllByText(/event!/i).length).toBe(3);
    
    // Clean up
    mockRandom.mockRestore();
  });
});