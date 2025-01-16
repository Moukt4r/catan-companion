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

    // Check initial text
    expect(screen.getByText(/chance to trigger a random event/)).toBeInTheDocument();
    expect(screen.getByText(/15%/)).toBeInTheDocument();
  });

  it('shows and updates settings panel', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    expect(settingsButton).toBeInTheDocument();
    
    act(() => {
      fireEvent.click(settingsButton!);
    });

    // Check settings panel content
    const enabledCheckbox = screen.getByLabelText('Enable random events');
    expect(enabledCheckbox).toBeChecked();

    const chanceInput = screen.getByLabelText('Event Chance (0-100%)') as HTMLInputElement;
    expect(chanceInput).toHaveValue('15');

    // Update chance
    act(() => {
      fireEvent.change(chanceInput, { target: { value: '25' } });
    });

    // Verify chance update
    expect(screen.getByText(/25%/)).toBeInTheDocument();
  });

  it('shows current event when triggered', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    expect(screen.getByText('Test event description')).toBeInTheDocument();
  });

  it('auto-dismisses events after timeout', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    expect(screen.getByText('Test event description')).toBeInTheDocument();

    // Fast-forward timeout
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.queryByText('Test event description')).not.toBeInTheDocument();
  });

  it('shows and hides event history', () => {
    render(<GameEvents initialEvent={mockEvent} />);

    // Click show history button
    act(() => {
      fireEvent.click(screen.getByText('Show History'));
    });

    expect(screen.getByText('Test event description')).toBeInTheDocument();

    // Click hide history button
    act(() => {
      fireEvent.click(screen.getByText('Hide History'));
    });

    // Event should still be visible in current event panel
    expect(screen.getByText('Test event description')).toBeInTheDocument();
  });

  it('disables events when unchecking enabled', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });

    // Uncheck enabled
    const enabledCheckbox = screen.getByLabelText('Enable random events');
    act(() => {
      fireEvent.click(enabledCheckbox);
    });

    expect(enabledCheckbox).not.toBeChecked();
    expect(screen.queryByText(/chance to trigger/)).not.toBeInTheDocument();
  });

  it('validates event chance', () => {
    render(<GameEvents />);
    
    // Open settings
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    act(() => {
      fireEvent.click(settingsButton!);
    });

    const chanceInput = screen.getByLabelText('Event Chance (0-100%)') as HTMLInputElement;

    // Test negative value
    act(() => {
      fireEvent.change(chanceInput, { target: { value: '-5' } });
    });
    expect(chanceInput).toHaveValue('0');

    // Test value over 100
    act(() => {
      fireEvent.change(chanceInput, { target: { value: '150' } });
    });
    expect(chanceInput).toHaveValue('100');
  });

  it('tracks event history', () => {
    const { rerender } = render(<GameEvents initialEvent={mockEvent} />);

    // Add another event
    const newEvent = { ...mockEvent, id: 2, description: 'Second event' };
    rerender(<GameEvents initialEvent={newEvent} />);

    // Show history
    act(() => {
      fireEvent.click(screen.getByText('Show History'));
    });

    // Should show both events
    expect(screen.getByText('Test event description')).toBeInTheDocument();
    expect(screen.getByText('Second event')).toBeInTheDocument();
  });

  it('shows event type indicators', () => {
    // Test positive event
    render(<GameEvents initialEvent={mockEvent} />);
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();

    // Test negative event
    const negativeEvent = { ...mockEvent, type: 'negative' as const };
    const { rerender } = render(<GameEvents initialEvent={negativeEvent} />);
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();

    // Test neutral event
    const neutralEvent = { ...mockEvent, type: 'neutral' as const };
    rerender(<GameEvents initialEvent={neutralEvent} />);
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });
});