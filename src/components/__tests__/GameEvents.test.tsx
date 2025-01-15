import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameEvents } from '../GameEvents';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon" />,
  CheckCircle2: () => <div data-testid="success-icon" />,
  AlertTriangle: () => <div data-testid="warning-icon" />,
  AlertCircle: () => <div data-testid="info-icon" />
}));

describe('GameEvents', () => {
  it('renders initial state correctly', () => {
    render(<GameEvents />);
    
    // Find settings button
    const settingsButton = screen.getByTitle('Configure events');
    expect(settingsButton).toBeInTheDocument();

    // Default text should be visible
    expect(screen.getByText(/chance to trigger a random event/)).toBeInTheDocument();
  });

  it('shows settings panel when clicking settings button', () => {
    render(<GameEvents />);
    
    const settingsButton = screen.getByTitle('Configure events');
    fireEvent.click(settingsButton);
    
    // Settings panel elements should be visible
    expect(screen.getByLabelText('Enable random events')).toBeInTheDocument();
    expect(screen.getByText('Event Chance (0-100%)')).toBeInTheDocument();
  });

  it('updates event chance correctly', () => {
    render(<GameEvents />);
    
    // Open settings
    fireEvent.click(screen.getByTitle('Configure events'));
    
    // Find and update chance input
    const chanceInput = screen.getByRole('spinbutton');
    fireEvent.change(chanceInput, { target: { value: '25' } });
    
    // Check if display updates
    expect(screen.getByText('25% chance to trigger a random event')).toBeInTheDocument();
  });

  it('handles events when triggered', () => {
    // Mock random to always trigger event
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.1;
    global.Math = mockMath;

    const ref = React.createRef<any>();
    render(<GameEvents ref={ref} />);
    
    // Trigger event
    ref.current.checkForEvent();
    
    // Verify event is displayed
    expect(screen.getByText('Event!')).toBeInTheDocument();
  });

  it('maintains event history correctly', () => {
    // Mock random to always trigger specific event index
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.1;
    global.Math = mockMath;

    const ref = React.createRef<any>();
    render(<GameEvents ref={ref} />);
    
    // Trigger multiple events
    ref.current.checkForEvent();
    ref.current.checkForEvent();
    
    // Show history
    fireEvent.click(screen.getByText('Show History'));
    
    // History should be displayed
    expect(screen.getAllByTestId('success-icon')).toHaveLength(2);
  });

  it('respects events enabled setting', () => {
    const ref = React.createRef<any>();
    render(<GameEvents ref={ref} />);
    
    // Open settings and disable events
    fireEvent.click(screen.getByTitle('Configure events'));
    fireEvent.click(screen.getByLabelText('Enable random events'));
    
    // Trigger event check
    ref.current.checkForEvent();
    
    // No event should be displayed
    expect(screen.queryByText('Event!')).not.toBeInTheDocument();
  });

  it('validates event chance input', () => {
    render(<GameEvents />);
    
    // Open settings
    fireEvent.click(screen.getByTitle('Configure events'));
    const input = screen.getByRole('spinbutton');
    
    // Test invalid values
    fireEvent.change(input, { target: { value: '-5' } });
    expect(screen.getByText('0% chance to trigger a random event')).toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: '150' } });
    expect(screen.getByText('100% chance to trigger a random event')).toBeInTheDocument();
  });

  it('auto-dismisses events after timeout', () => {
    jest.useFakeTimers();
    
    const ref = React.createRef<any>();
    render(<GameEvents ref={ref} />);
    
    // Trigger event
    ref.current.checkForEvent();
    expect(screen.getByText('Event!')).toBeInTheDocument();
    
    // Fast-forward time
    jest.advanceTimersByTime(10000);
    expect(screen.queryByText('Event!')).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('displays correct icons for event types', () => {
    const mockMath = Object.create(global.Math);
    let currentIndex = 0;
    mockMath.random = () => {
      // First call is for event trigger, second for event selection
      return currentIndex++ === 0 ? 0.1 : 0;
    };
    global.Math = mockMath;

    const ref = React.createRef<any>();
    render(<GameEvents ref={ref} />);
    
    // Trigger events of different types
    ref.current.checkForEvent(); // Should get positive event
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
  });
});