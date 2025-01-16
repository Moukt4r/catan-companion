import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameEvents } from '../GameEvents';

// Mock icons
jest.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon" />,
  History: () => <div data-testid="history-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  CheckCircle2: () => <div data-testid="success-icon" />,
  AlertTriangle: () => <div data-testid="warning-icon" />,
  AlertCircle: () => <div data-testid="info-icon" />,
  X: () => <div data-testid="close-icon" />
}));

describe('GameEvents', () => {
  const mockEvent = {
    id: 1,
    type: 'positive' as const,
    description: 'Test event description'
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders initial state correctly', () => {
    render(<GameEvents />);
    
    // Open settings to see event chance
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });

    expect(screen.getByText(/Event Chance \(0-100%\)/)).toBeInTheDocument();
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(parseInt(input.value)).toBe(15); // 15% default
  });

  it('shows current event when triggered', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    expect(screen.getByText('Test event description')).toBeInTheDocument();
  });

  it('updates event chance', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });
    
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: '25' } });
    });

    // Verify display updates
    expect(screen.getByText(/25%/)).toBeInTheDocument();
  });

  it('validates event chance input', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });
    
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    
    // Test invalid values
    act(() => {
      fireEvent.change(input, { target: { value: '-5' } });
    });
    expect(screen.getByText(/15%/)).toBeInTheDocument();

    act(() => {
      fireEvent.change(input, { target: { value: '150' } });
    });
    expect(screen.getByText(/15%/)).toBeInTheDocument();
  });

  it('shows and hides event history', () => {
    // Add some history
    render(<GameEvents initialEvent={mockEvent} />);
    
    // History button should appear after dismissing event
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    act(() => {
      fireEvent.click(dismissButton);
    });
    
    // Toggle history visibility
    const historyToggleButton = screen.getByRole('button', { name: /history/i });
    act(() => {
      fireEvent.click(historyToggleButton);
    });
    
    // Should show history panel with event
    expect(screen.getByRole('heading', { name: /event history/i })).toBeInTheDocument();
    expect(screen.getByText(/Test event description/)).toBeInTheDocument();
    
    // Hide history
    act(() => {
      fireEvent.click(historyToggleButton);
    });
    
    expect(screen.queryByText(/Test event description/)).not.toBeInTheDocument();
  });

  it('shows and hides event stats', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    const statsButton = screen.getByRole('button', { name: /statistics/i });
    act(() => {
      fireEvent.click(statsButton);
    });
    
    expect(screen.getByRole('heading', { name: /event statistics/i })).toBeInTheDocument();
    
    // Close stats
    const closeButton = screen.getByTestId('close-icon').closest('button');
    act(() => {
      fireEvent.click(closeButton!);
    });
    
    expect(screen.queryByText(/event statistics/i)).not.toBeInTheDocument();
  });

  it('handles dismiss of current event', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    act(() => {
      fireEvent.click(dismissButton);
    });
    
    expect(screen.queryByText(/Test event description/)).not.toBeInTheDocument();
  });

  it('maintains event history', () => {
    const { rerender } = render(<GameEvents initialEvent={mockEvent} />);
    
    // Dismiss first event
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    act(() => {
      fireEvent.click(dismissButton);
    });
    
    // Add another event
    const secondEvent = { ...mockEvent, id: 2, description: 'Second event' };
    rerender(<GameEvents initialEvent={secondEvent} />);
    
    // Show history
    const historyButton = screen.getByRole('button', { name: /history/i });
    act(() => {
      fireEvent.click(historyButton);
    });
    
    // Should show both events
    expect(screen.getByText(/Test event description/)).toBeInTheDocument();
    expect(screen.getByText(/Second event/)).toBeInTheDocument();
  });

  it('auto-dismisses events after timeout', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    expect(screen.getByText(/Test event description/)).toBeInTheDocument();
    
    // Fast forward past auto-dismiss timeout
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    expect(screen.queryByText(/Test event description/)).not.toBeInTheDocument();
  });

  it('toggles enable/disable of random events', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });

    const enableToggle = screen.getByRole('checkbox', { name: /enable random events/i });
    
    // Disable events
    act(() => {
      fireEvent.click(enableToggle);
    });
    expect(enableToggle).not.toBeChecked();
    
    // Re-enable events
    act(() => {
      fireEvent.click(enableToggle);
    });
    expect(enableToggle).toBeChecked();
  });
});