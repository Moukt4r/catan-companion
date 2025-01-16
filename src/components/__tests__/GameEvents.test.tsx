import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
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

const testEvents = [
  { id: 1, type: 'positive' as const, description: 'Test Positive Event' },
  { id: 2, type: 'neutral' as const, description: 'Test Neutral Event' },
  { id: 3, type: 'negative' as const, description: 'Test Negative Event' }
];

describe('GameEvents', () => {
  let originalMath: Math;

  beforeEach(() => {
    originalMath = global.Math;
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.Math = originalMath;
  });

  it('renders initial state correctly', () => {
    render(<GameEvents events={testEvents} />);
    
    expect(screen.getByText('Game Events')).toBeInTheDocument();
    expect(screen.getByTitle('Configure events')).toBeInTheDocument();
    expect(screen.getByText(/15% chance to trigger/i)).toBeInTheDocument();
  });

  it('shows settings panel when clicked', () => {
    render(<GameEvents events={testEvents} />);
    
    fireEvent.click(screen.getByTitle('Configure events'));
    
    expect(screen.getByLabelText('Enable random events')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Chance (0-100%)')).toBeInTheDocument();
    
    const checkbox = screen.getByRole('checkbox', { name: /enable random events/i });
    expect(checkbox).toBeChecked();
    
    const chanceInput = screen.getByRole('spinbutton');
    expect(chanceInput).toHaveValue(15);
  });

  it('handles event triggering correctly', () => {
    const ref = React.createRef<GameEventsRef>();
    const mockMath = Object.create(global.Math);
    
    // Mock Math.random to always trigger event and select first event
    let calls = 0;
    mockMath.random = () => {
      calls++;
      return calls === 1 ? 0.1 : 0; // First call triggers event, second call selects first event
    };
    global.Math = mockMath;
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    act(() => {
      ref.current?.checkForEvent();
    });

    // Check event is displayed
    expect(screen.getByTestId('current-event')).toBeInTheDocument();
    expect(screen.getByText('Test Positive Event')).toBeInTheDocument();
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
  });

  it('auto-dismisses events after timeout', () => {
    const ref = React.createRef<GameEventsRef>();
    const mockMath = Object.create(global.Math);
    
    let calls = 0;
    mockMath.random = () => {
      calls++;
      return calls === 1 ? 0.1 : 0;
    };
    global.Math = mockMath;
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    act(() => {
      ref.current?.checkForEvent();
    });
    
    expect(screen.getByText('Test Positive Event')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    expect(screen.queryByText('Test Positive Event')).not.toBeInTheDocument();
  });

  it('maintains event history', () => {
    const ref = React.createRef<GameEventsRef>();
    const mockMath = Object.create(global.Math);
    
    // Mock Math.random to trigger events in sequence
    let calls = 0;
    mockMath.random = () => {
      calls++;
      if (calls % 2 === 1) return 0.1; // Trigger event
      return Math.floor((calls - 2) / 2) / testEvents.length; // Select events in sequence
    };
    global.Math = mockMath;
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    // Generate events
    act(() => {
      ref.current?.checkForEvent(); // Generate first event
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent(); // Generate second event
    });
    
    // Show history
    fireEvent.click(screen.getByText(/show history/i));

    // Check history using test IDs
    expect(screen.getByTestId('history-event-neutral-0')).toBeInTheDocument();
    expect(screen.getByTestId('history-event-positive-1')).toBeInTheDocument();
  });

  it('handles different event types', () => {
    const ref = React.createRef<GameEventsRef>();
    const mockMath = Object.create(global.Math);
    
    // Mock Math.random to trigger events in sequence
    let calls = 0;
    mockMath.random = () => {
      calls++;
      if (calls % 2 === 1) return 0.1; // Trigger event
      return Math.floor((calls - 2) / 2) / testEvents.length; // Select events in sequence
    };
    global.Math = mockMath;
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    // Generate all event types
    act(() => {
      ref.current?.checkForEvent(); // Generate positive
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent(); // Generate neutral
      jest.advanceTimersByTime(10000);
      ref.current?.checkForEvent(); // Generate negative
    });
    
    // Show history
    fireEvent.click(screen.getByText(/show history/i));

    // Check each event type in history using test IDs
    expect(screen.getByTestId('history-event-positive-2')).toBeInTheDocument();
    expect(screen.getByTestId('history-event-neutral-1')).toBeInTheDocument();
    expect(screen.getByTestId('history-event-negative-0')).toBeInTheDocument();
  });

  it('updates event chance correctly', () => {
    render(<GameEvents events={testEvents} />);
    
    fireEvent.click(screen.getByTitle('Configure events'));
    
    const chanceInput = screen.getByLabelText('Event Chance (0-100%)');
    fireEvent.change(chanceInput, { target: { value: '25' } });
    
    expect(screen.getByText(/25% chance to trigger/i)).toBeInTheDocument();
  });

  it('handles event disabling', () => {
    const ref = React.createRef<GameEventsRef>();
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.1; // Always try to trigger
    global.Math = mockMath;
    
    render(<GameEvents ref={ref} events={testEvents} />);
    
    // Disable events
    fireEvent.click(screen.getByTitle('Configure events'));
    const checkbox = screen.getByLabelText('Enable random events');
    fireEvent.click(checkbox);
    
    // Try to trigger event
    act(() => {
      ref.current?.checkForEvent();
    });
    
    // No event should be shown
    expect(screen.queryByTestId('current-event')).not.toBeInTheDocument();
  });
});