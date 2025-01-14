import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventDisplay from '../EventDisplay';
import type { GameEvent } from '../../types/eventTypes';

describe('EventDisplay', () => {
  const mockEvent: GameEvent = {
    id: 'test-event',
    title: 'Test Event',
    description: 'Test Description',
    type: 'positive',
    severity: 'low',
    category: 'resource'
  };

  const mockClose = jest.fn();

  beforeEach(() => {
    mockClose.mockClear();
  });

  it('renders event title and description', () => {
    render(<EventDisplay event={mockEvent} onClose={mockClose} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<EventDisplay event={mockEvent} onClose={mockClose} />);
    const closeButton = screen.getByLabelText('Close event notification');
    fireEvent.click(closeButton);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('applies correct styles based on event type', () => {
    const events: GameEvent[] = [
      { ...mockEvent, type: 'positive' },
      { ...mockEvent, type: 'negative' },
      { ...mockEvent, type: 'neutral' }
    ];

    const { rerender } = render(<EventDisplay event={events[0]} onClose={mockClose} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');

    rerender(<EventDisplay event={events[1]} onClose={mockClose} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');

    rerender(<EventDisplay event={events[2]} onClose={mockClose} />);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
  });

  it('renders appropriate icon for event type', () => {
    const { rerender } = render(<EventDisplay event={mockEvent} onClose={mockClose} />);
    expect(document.querySelector('svg')).toBeInTheDocument();

    rerender(<EventDisplay event={{ ...mockEvent, type: 'negative' }} onClose={mockClose} />);
    expect(document.querySelector('svg')).toBeInTheDocument();

    rerender(<EventDisplay event={{ ...mockEvent, type: 'neutral' }} onClose={mockClose} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});