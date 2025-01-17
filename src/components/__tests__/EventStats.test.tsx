import React from 'react';
import { render, screen } from '@testing-library/react';
import EventStats from '../EventStats';
import type { GameEvent } from '@/types/events';

describe('EventStats', () => {
  const mockEvents: GameEvent[] = [
    {
      id: 'test-1',
      type: 'positive',
      category: 'resource',
      severity: 'low',
      text: 'Gained resources',
      timestamp: new Date()
    },
    {
      id: 'test-2',
      type: 'negative',
      category: 'trade',
      severity: 'high',
      text: 'Lost trade',
      timestamp: new Date()
    },
    {
      id: 'test-3',
      type: 'neutral',
      category: 'military',
      severity: 'medium',
      text: 'Military event',
      timestamp: new Date()
    }
  ];

  it('renders statistics overview', () => {
    render(<EventStats events={mockEvents} />);
    expect(screen.getByText('Event Statistics')).toBeInTheDocument();
    expect(screen.getByText('By Category')).toBeInTheDocument();
    expect(screen.getByText('By Type')).toBeInTheDocument();
    expect(screen.getByText('Total Events: 3')).toBeInTheDocument();
  });

  it('renders category breakdown', () => {
    render(<EventStats events={mockEvents} />);
    
    // Category counts
    expect(screen.getByText('resource')).toBeInTheDocument();
    expect(screen.getByText('trade')).toBeInTheDocument();
    expect(screen.getByText('military')).toBeInTheDocument();
  });

  it('renders type breakdown', () => {
    render(<EventStats events={mockEvents} />);
    
    // Type counts
    expect(screen.getByText('positive')).toBeInTheDocument();
    expect(screen.getByText('negative')).toBeInTheDocument();
    expect(screen.getByText('neutral')).toBeInTheDocument();
  });

  it('handles empty events list', () => {
    render(<EventStats events={[]} />);
    expect(screen.getByText('Event Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Events: 0')).toBeInTheDocument();
  });

  it('displays correct counts for repeated categories', () => {
    const eventsWithDuplicates: GameEvent[] = [
      ...mockEvents,
      {
        id: 'test-4',
        type: 'positive',
        category: 'resource',
        severity: 'medium',
        text: 'More resources',
        timestamp: new Date()
      }
    ];

    render(<EventStats events={eventsWithDuplicates} />);

    // Find the resource category display
    const resourceSpans = screen.getAllByText('resource');
    const resourceCount = resourceSpans[0].nextSibling;
    expect(resourceCount).toHaveTextContent('2');

    expect(screen.getByText('Total Events: 4')).toBeInTheDocument();
  });

  it('formats category and type names correctly', () => {
    render(<EventStats events={mockEvents} />);

    // Check for capitalized category names
    const categories = screen.getAllByText(/resource|trade|military/);
    categories.forEach(category => {
      expect(category).toHaveClass('capitalize');
    });

    // Check for capitalized type names
    const types = screen.getAllByText(/positive|negative|neutral/);
    types.forEach(type => {
      expect(type).toHaveClass('capitalize');
    });
  });

  it('maintains correct grid layouts', () => {
    render(<EventStats events={mockEvents} />);

    // Check category grid
    const categoryGrid = screen.getByText('By Category').nextSibling;
    expect(categoryGrid).toHaveClass('grid', 'grid-cols-2', 'gap-2');

    // Check type grid
    const typeGrid = screen.getByText('By Type').nextSibling;
    expect(typeGrid).toHaveClass('grid', 'grid-cols-2', 'gap-2');
  });
});