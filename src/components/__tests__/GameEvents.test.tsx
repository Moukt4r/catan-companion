import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameEvents, GameEventsRef } from '../GameEvents';

// Mock the Lucide React icons
jest.mock('lucide-react', () => ({
  CheckCircle2: () => <div data-testid="success-icon">Success</div>,
  AlertTriangle: () => <div data-testid="warning-icon">Warning</div>,
  AlertCircle: () => <div data-testid="info-icon">Info</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>
}));

// Mock the setTimeout and clearTimeout functions
jest.useFakeTimers();

describe('GameEvents', () => {
  // Mock data for testing
  const testEvents = [
    { 
      id: 1, 
      type: 'positive' as const, 
      description: 'Test Positive Event'
    },
    { 
      id: 2, 
      type: 'neutral' as const, 
      description: 'Test Neutral Event'
    },
    { 
      id: 3, 
      type: 'negative' as const, 
      description: 'Test Negative Event'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('renders initial state correctly', () => {
    render(<GameEvents events={testEvents} />);
    
    // Check component title
    expect(screen.getByText('Game Events')).toBeInTheDocument();
    
    // Check settings button exists
    expect(screen.getByTitle('Configure events')).toBeInTheDocument();
    
    // Check initial text is shown
    expect(screen.getByText(/15% chance to trigger/i)).toBeInTheDocument();
  });

  it('shows settings panel when clicked', () => {
    render(<GameEvents events={testEvents} />);
    
    // Click settings button
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Check settings panel elements
    expect(screen.getByText('Enable random events')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Chance (0-100%)')).toBeInTheDocument();
    
    // Check inputs
    const checkbox = screen.getByRole('checkbox', { name: /enable random events/i });
    expect(checkbox).toBeChecked();
    
    const chanceInput = screen.getByRole('spinbutton');
    expect(chanceInput).toHaveValue(15); // Default 15%
  });

  it('handles event triggering correctly', () => {
    const ref = React.createRef<GameEventsRef>();
    
    // Mock Math.random
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.1); // Trigger event
    mockRandom.mockReturnValueOnce(0); // Select first event
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    // Trigger event check
    act(() => {
      ref.current?.checkForEvent();
      jest.runAllTimers(); // Run any pending timers
    });
    
    // Verify event is displayed
    expect(screen.getByText('Test Positive Event')).toBeInTheDocument();
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    
    // Clean up
    mockRandom.mockRestore();
  });

  it('updates event chance correctly', () => {
    render(<GameEvents events={testEvents} />);
    
    // Open settings
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Change event chance
    const chanceInput = screen.getByRole('spinbutton');
    fireEvent.change(chanceInput, { target: { value: '25' } });
    
    // Check if the text updates
    expect(screen.getByText(/25% chance to trigger/i)).toBeInTheDocument();
  });

  it('handles event disabling', () => {
    render(<GameEvents events={testEvents} />);
    
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
    
    // Mock Math.random
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.1); // Trigger event
    mockRandom.mockReturnValueOnce(0); // Select first event
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    // Trigger event
    act(() => {
      ref.current?.checkForEvent();
      jest.runOnlyPendingTimers(); // Run only pending timers
    });
    
    // Verify event is shown
    expect(screen.getByText('Test Positive Event')).toBeInTheDocument();
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Verify event is dismissed
    expect(screen.queryByText('Test Positive Event')).not.toBeInTheDocument();
    
    // Clean up
    mockRandom.mockRestore();
  });

  it('maintains event history', () => {
    const ref = React.createRef<GameEventsRef>();
    
    // Mock Math.random
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(0) // Select first event
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(1); // Select second event
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    // Trigger multiple events
    act(() => {
      ref.current?.checkForEvent();
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent();
    });
    
    // Show history
    const historyButton = screen.getByText(/show history/i);
    fireEvent.click(historyButton);
    
    // Verify events are in history
    expect(screen.getAllByText(/Test .* Event/)).toHaveLength(2);
    
    // Clean up
    mockRandom.mockRestore();
  });

  it('handles different event types', () => {
    const ref = React.createRef<GameEventsRef>();
    
    // Mock Math.random
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(0) // Select first event (positive)
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(1) // Select second event (neutral)
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(2); // Select third event (negative)
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    // Trigger events
    act(() => {
      ref.current?.checkForEvent(); // Positive
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent(); // Neutral
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent(); // Negative
    });
    
    // Show history
    fireEvent.click(screen.getByText(/show history/i));
    
    // Verify different event types are shown
    expect(screen.getByText('Test Negative Event')).toBeInTheDocument();
    expect(screen.getByText('Test Neutral Event')).toBeInTheDocument();
    expect(screen.getByText('Test Positive Event')).toBeInTheDocument();
    
    // Clean up
    mockRandom.mockRestore();
  });
});