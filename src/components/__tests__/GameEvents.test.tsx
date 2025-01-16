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
    const chanceLabel = screen.getByText('Event Chance (0-100%)');
    expect(chanceLabel).toBeInTheDocument();
    
    // Check inputs
    const checkbox = screen.getByRole('checkbox', { name: /enable random events/i });
    expect(checkbox).toBeChecked();
    
    // Find input by type=number
    const chanceInput = screen.getByRole('spinbutton');
    expect(chanceInput).toHaveValue(15); // Default 15%
  });

  it('handles event triggering correctly', () => {
    const ref = React.createRef<GameEventsRef>();
    
    // Mock Math.random
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.1); // Trigger event
    mockRandom.mockReturnValueOnce(0); // Select first event
    
    render(<GameEvents ref={ref} />);
    
    // Trigger event check
    act(() => {
      ref.current?.checkForEvent();
    });
    
    // Verify event is displayed
    expect(screen.getByText('Test event description')).toBeInTheDocument();
    expect(screen.getByTestId('success-icon')).toBeInTheDocument(); // Positive event icon
    
    // Clean up
    mockRandom.mockRestore();
  });

  it('updates event chance correctly', () => {
    render(<GameEvents />);
    
    // Open settings
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Change event chance
    const chanceInput = screen.getByRole('spinbutton');
    fireEvent.change(chanceInput, { target: { value: '25' } });
    
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
    
    // Mock Math.random
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.1); // Trigger event
    mockRandom.mockReturnValueOnce(0); // Select first event
    
    render(<GameEvents ref={ref} />);
    
    // Trigger event
    act(() => {
      ref.current?.checkForEvent();
    });
    
    // Verify event is shown
    expect(screen.getByText('Test event description')).toBeInTheDocument();
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Verify event is dismissed
    expect(screen.queryByText('Test event description')).not.toBeInTheDocument();
    
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
      .mockReturnValueOnce(0); // Select first event again
    
    render(<GameEvents ref={ref} />);
    
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
    const historyItems = screen.getAllByText('Test event description');
    expect(historyItems.length).toBe(2);
    
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
      .mockReturnValueOnce(0.5) // Select middle event (neutral)
      .mockReturnValueOnce(0.1) // Trigger event
      .mockReturnValueOnce(0.9); // Select last event (negative)
    
    render(<GameEvents ref={ref} />);
    
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
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    
    // Clean up
    mockRandom.mockRestore();
  });
});