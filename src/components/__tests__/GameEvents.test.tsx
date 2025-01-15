import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameEvents } from '../GameEvents';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Settings: () => <div data-testid="settings-icon" />,
  History: () => <div data-testid="history-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />
}));

describe('GameEvents', () => {
  const mockEvent = {
    id: 'test-1',
    type: 'positive' as const,
    category: 'resource' as const,
    severity: 'low',
    title: 'Test Event',
    description: 'Test event description'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.Math, 'random').mockReturnValue(0.1); // For predictable results
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('renders initial state', () => {
    render(<GameEvents />);
    expect(screen.getByText('Event Chance:')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(15); // Default value
  });

  it('shows current event when triggered', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test event description')).toBeInTheDocument();
  });

  it('updates event chance', () => {
    render(<GameEvents />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '25' } });
    expect(input).toHaveValue(25);
  });

  it('validates event chance input', () => {
    render(<GameEvents />);
    const input = screen.getByRole('spinbutton');
    
    // Test invalid values
    fireEvent.change(input, { target: { value: '-5' } });
    expect(input).toHaveValue(15); // Should keep default

    fireEvent.change(input, { target: { value: '105' } });
    expect(input).toHaveValue(15); // Should keep default
  });

  it('shows and hides event history', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    const historyButton = screen.getByTestId('history-icon');
    fireEvent.click(historyButton);
    
    expect(screen.getByText('Event History')).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: /close history/i });
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Event History')).not.toBeInTheDocument();
  });

  it('shows and hides event stats', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    const statsButton = screen.getByTestId('pie-chart-icon');
    fireEvent.click(statsButton);
    
    expect(screen.getByText('Event Statistics')).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: /close statistics/i });
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Event Statistics')).not.toBeInTheDocument();
  });

  it('handles dismiss of current event', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);
    
    expect(screen.queryByText('Test Event')).not.toBeInTheDocument();
  });

  it('maintains event history', () => {
    render(<GameEvents initialEvent={mockEvent} />);
    
    // Dismiss current event
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);
    
    // Check history
    const historyButton = screen.getByTestId('history-icon');
    fireEvent.click(historyButton);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('shows event settings panel', () => {
    render(<GameEvents />);
    
    const settingsButton = screen.getByTestId('settings-icon');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Event Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Chance:')).toBeInTheDocument();
  });

  it('toggles auto-dismiss setting', () => {
    render(<GameEvents />);
    
    const settingsButton = screen.getByTestId('settings-icon');
    fireEvent.click(settingsButton);
    
    const autoDismissToggle = screen.getByRole('checkbox', { name: /auto-dismiss/i });
    fireEvent.click(autoDismissToggle);
    
    expect(autoDismissToggle).toBeChecked();
  });

  it('shows event stats with no events', () => {
    render(<GameEvents />);
    
    const statsButton = screen.getByTestId('pie-chart-icon');
    fireEvent.click(statsButton);
    
    expect(screen.getByText('No events recorded yet')).toBeInTheDocument();
  });
});