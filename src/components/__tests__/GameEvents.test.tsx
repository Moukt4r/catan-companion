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
  XCircle: () => <div data-testid="close-icon" />
}));

// Mock event types for testing
const mockEvent = {
  id: 1,
  type: 'positive' as const,
  description: 'Test event description'
};

describe('GameEvents', () => {
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

    // Check event chance input exists and has default value
    const input = screen.getByLabelText('Event Chance (0-100%)') as HTMLInputElement;
    expect(parseInt(input.value)).toBe(15); // 15% default

    // Check initial event description is shown
    expect(screen.getByText(/chance to trigger a random event/)).toBeInTheDocument();
  });

  it('shows current event when triggered', async () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    // Event should be displayed
    expect(screen.getByText('Test event description')).toBeInTheDocument();
    expect(screen.getByTestId('success-icon')).toBeInTheDocument(); // Positive event icon
  });

  it('updates event chance correctly', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });
    
    // Update chance value
    const input = screen.getByLabelText('Event Chance (0-100%)') as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: '25' } });
    });

    // Verify display updates
    expect(screen.getByText(/25% chance/)).toBeInTheDocument();
  });

  it('validates event chance input', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });
    
    const input = screen.getByLabelText('Event Chance (0-100%)') as HTMLInputElement;
    
    // Test negative value
    act(() => {
      fireEvent.change(input, { target: { value: '-5' } });
    });
    expect(screen.getByText(/0% chance/)).toBeInTheDocument();

    // Test value over 100
    act(() => {
      fireEvent.change(input, { target: { value: '150' } });
    });
    expect(screen.getByText(/100% chance/)).toBeInTheDocument();

    // Test non-numeric
    act(() => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    expect(screen.getByText(/15% chance/)).toBeInTheDocument(); // Back to default
  });

  it('handles event history display', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    // Close current event
    const closeButton = screen.getByRole('button', { name: /dismiss/i });
    act(() => {
      fireEvent.click(closeButton);
    });
    
    // Toggle history
    const historyButton = screen.getByText(/Show History/);
    act(() => {
      fireEvent.click(historyButton);
    });
    
    // History should be visible
    expect(screen.getByText('Test event description')).toBeInTheDocument();
    
    // Hide history
    act(() => {
      fireEvent.click(screen.getByText(/Hide History/));
    });
    
    // History should be hidden
    expect(screen.queryByText('Test event description')).not.toBeInTheDocument();
  });

  it('shows event statistics', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    const statsButton = screen.getByTestId('pie-chart-icon').closest('button');
    act(() => {
      fireEvent.click(statsButton!);
    });
    
    // Stats should be visible
    expect(screen.getByText('Event Statistics')).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();
  });

  it('auto-dismisses events after timeout', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    // Event should be visible initially
    expect(screen.getByText('Test event description')).toBeInTheDocument();
    
    // Advance timers
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Event should be dismissed
    expect(screen.queryByText('Test event description')).not.toBeInTheDocument();
  });

  it('allows toggling auto-dismiss', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });
    
    // Find and toggle auto-dismiss
    const autoDismissToggle = screen.getByLabelText('Auto-dismiss events');
    act(() => {
      fireEvent.click(autoDismissToggle);
    });
    
    expect(autoDismissToggle).toBeChecked();
  });

  it('maintains multiple events in history', () => {
    const { rerender } = render(<GameEvents initialEvent={mockEvent} />);
    
    // Close first event
    const closeButton = screen.getByRole('button', { name: /dismiss/i });
    act(() => {
      fireEvent.click(closeButton);
    });
    
    // Add second event
    const secondEvent = { ...mockEvent, id: 2, description: 'Second event' };
    rerender(<GameEvents initialEvent={secondEvent} />);
    
    // Show history
    const historyButton = screen.getByText(/Show History/);
    act(() => {
      fireEvent.click(historyButton);
    });
    
    // Both events should be in history
    expect(screen.getByText('Test event description')).toBeInTheDocument();
    expect(screen.getByText('Second event')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<GameEvents />);
    
    const statsButton = screen.getByTestId('pie-chart-icon').closest('button');
    act(() => {
      fireEvent.click(statsButton!);
    });
    
    expect(screen.getByText('No events recorded yet')).toBeInTheDocument();
  });

  it('handles different event types correctly', async () => {
    // Test positive event
    const { rerender } = render(<GameEvents initialEvent={mockEvent} />);
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();

    // Test negative event
    const negativeEvent = { ...mockEvent, type: 'negative' as const };
    rerender(<GameEvents initialEvent={negativeEvent} />);
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();

    // Test neutral event
    const neutralEvent = { ...mockEvent, type: 'neutral' as const };
    rerender(<GameEvents initialEvent={neutralEvent} />);
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });
});