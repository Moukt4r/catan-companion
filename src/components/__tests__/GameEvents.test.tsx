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

  it('shows correct style for each event type', () => {
    render(<GameEvents ref={ref} />);
    
    // Test positive event
    // First 0.1 for event trigger chance, second 0.1 for index 3 (0-9 are positive events)
    randomSpy.mockReturnValueOnce(0.1).mockReturnValueOnce(0.3); 
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

    // Test negative event
    // 0.1 for trigger, 0.5 for index 13 (10-19 are negative events)
    randomSpy.mockReturnValueOnce(0.1).mockReturnValueOnce(0.45); 
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

    // Test neutral event
    // 0.1 for trigger, 0.8 for index 24 (20-29 are neutral events)
    randomSpy.mockReturnValueOnce(0.1).mockReturnValueOnce(0.75); 
    act(() => {
      ref.current?.checkForEvent();
    });
    expect(screen.getByTestId('neutral-icon')).toBeInTheDocument();
    event = screen.getByTestId('current-event');
    expect(event).toHaveClass('bg-blue-50', 'border-blue-500');
  });

  // ... rest of your tests ...
});