import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventStats } from '../EventStats';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />
}));

describe('EventStats', () => {
  const mockOnClose = jest.fn();

  const mockEvents = [
    {
      id: 'test-1',
      type: 'positive' as const,
      category: 'resource' as const,
      severity: 'low',
      title: 'Test Positive',
      description: 'Positive event description'
    },
    {
      id: 'test-2',
      type: 'negative' as const,
      category: 'trade' as const,
      severity: 'high',
      title: 'Test Negative',
      description: 'Negative event description'
    },
    {
      id: 'test-3',
      type: 'neutral' as const,
      category: 'military' as const,
      severity: 'medium',
      title: 'Test Neutral',
      description: 'Neutral event description'
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without events', () => {
    render(<EventStats events={[]} onClose={mockOnClose} />);
    expect(screen.getByText('Event Statistics')).toBeInTheDocument();
    expect(screen.getByText('Events by Category')).toBeInTheDocument();
    expect(screen.getByText('Events by Severity')).toBeInTheDocument();
  });

  it('renders event category breakdown', () => {
    render(<EventStats events={mockEvents} onClose={mockOnClose} />);

    expect(screen.getByText('Resource Events')).toBeInTheDocument();
    expect(screen.getByText('Trade Events')).toBeInTheDocument();
    expect(screen.getByText('Military Events')).toBeInTheDocument();

    expect(screen.getByText('Total: 1')).toBeInTheDocument();
    expect(screen.getByText('Positive: 1')).toBeInTheDocument();
    expect(screen.getByText('Negative: 1')).toBeInTheDocument();
    expect(screen.getByText('Neutral: 1')).toBeInTheDocument();
  });

  it('renders severity breakdown', () => {
    render(<EventStats events={mockEvents} onClose={mockOnClose} />);

    // Each severity should show its count and percentage
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('33.3%')).toBeInTheDocument();

    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('33.3%')).toBeInTheDocument();

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('33.3%')).toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(<EventStats events={mockEvents} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('close-icon'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays detailed type breakdown', () => {
    const manyEvents = [
      ...mockEvents,
      {
        id: 'test-4',
        type: 'positive' as const,
        category: 'resource' as const,
        severity: 'low',
        title: 'Another Positive',
        description: 'Another positive event'
      }
    ];

    render(<EventStats events={manyEvents} onClose={mockOnClose} />);

    // Resource category should show 2 total events
    const resourceSection = screen.getByText('Resource Events').closest('.bg-gray-50');
    expect(resourceSection).toHaveTextContent('Total: 2');
    expect(resourceSection).toHaveTextContent('Positive: 2');
  });

  it('displays zero counts for empty categories', () => {
    const limitedEvents = [{
      id: 'test-1',
      type: 'positive' as const,
      category: 'resource' as const,
      severity: 'low',
      title: 'Test Positive',
      description: 'Positive event description'
    }];

    render(<EventStats events={limitedEvents} onClose={mockOnClose} />);

    // Trade category should show all zeros except total
    const tradeSection = screen.getByText('Trade Events').closest('.bg-gray-50');
    expect(tradeSection).toHaveTextContent('Total: 0');
    expect(tradeSection).toHaveTextContent('Positive: 0');
    expect(tradeSection).toHaveTextContent('Negative: 0');
    expect(tradeSection).toHaveTextContent('Neutral: 0');
  });
});