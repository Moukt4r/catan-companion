import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventHistory } from '../EventHistory';
import type { EventHistoryEntry } from '../../types/eventTypes';

const mockOnClose = jest.fn();

const createMockEntry = (
  type: 'positive' | 'negative' | 'neutral',
  dismissed = false,
  timestamp = new Date('2024-01-01T12:00:00').getTime()
): EventHistoryEntry => ({
  event: {
    id: `test-${type}`,
    type,
    title: `Test ${type} Event`,
    description: `This is a ${type} event`,
  },
  timestamp,
  dismissed,
});

describe('EventHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no history is provided', () => {
    render(<EventHistory history={[]} onClose={mockOnClose} />);
    
    expect(screen.getByText('No events recorded yet')).toBeInTheDocument();
  });

  it('renders a list of events with correct styling', () => {
    const history = [
      createMockEntry('positive'),
      createMockEntry('negative'),
      createMockEntry('neutral'),
    ];

    render(<EventHistory history={history} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test positive Event')).toBeInTheDocument();
    expect(screen.getByText('Test negative Event')).toBeInTheDocument();
    expect(screen.getByText('Test neutral Event')).toBeInTheDocument();

    // Check for correct styling classes
    const events = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-green-50') ||
      el.className.includes('bg-red-50') ||
      el.className.includes('bg-blue-50')
    );
    expect(events).toHaveLength(3);
  });

  it('displays timestamps in correct format', () => {
    const history = [createMockEntry('positive')];
    
    render(<EventHistory history={history} onClose={mockOnClose} />);
    
    expect(screen.getByText('12:00:00 PM')).toBeInTheDocument();
  });

  it('applies opacity styling to dismissed events', () => {
    const history = [
      createMockEntry('positive', true),
      createMockEntry('negative', false),
    ];

    render(<EventHistory history={history} onClose={mockOnClose} />);
    
    const events = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-green-50') ||
      el.className.includes('bg-red-50')
    );

    expect(events[0].className).toContain('opacity-50');
    expect(events[1].className).not.toContain('opacity-50');
  });

  it('calls onClose when close button is clicked', () => {
    render(<EventHistory history={[]} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close history');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders event details correctly', () => {
    const event = createMockEntry('positive');
    
    render(<EventHistory history={[event]} onClose={mockOnClose} />);
    
    expect(screen.getByText(event.event.title)).toBeInTheDocument();
    expect(screen.getByText(event.event.description)).toBeInTheDocument();
  });
});