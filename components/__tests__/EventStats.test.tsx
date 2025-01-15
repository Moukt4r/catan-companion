import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventStats } from '../EventStats';
import type { GameEvent } from '../../types/eventTypes';

const mockOnClose = jest.fn();

const createMockEvent = (
  category: 'resource' | 'trade' | 'development' | 'military' | 'infrastructure',
  type: 'positive' | 'negative' | 'neutral' = 'positive',
  severity: 'low' | 'medium' | 'high' = 'medium'
): GameEvent => ({
  id: `test-${category}-${type}`,
  category,
  type,
  severity,
  title: `Test ${category} ${type} Event`,
  description: `This is a ${type} ${category} event`,
});

describe('EventStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders event statistics correctly', () => {
    const events = [
      createMockEvent('resource', 'positive', 'low'),
      createMockEvent('resource', 'negative', 'medium'),
      createMockEvent('trade', 'neutral', 'high'),
    ];

    render(<EventStats events={events} onClose={mockOnClose} />);
    
    // Check category breakdown
    expect(screen.getByText('Resource Events')).toBeInTheDocument();
    expect(screen.getByText('Trade Events')).toBeInTheDocument();
    
    // Check counts
    expect(screen.getByText('Total: 2')).toBeInTheDocument(); // Resource events
    expect(screen.getByText('Positive: 1')).toBeInTheDocument();
    expect(screen.getByText('Negative: 1')).toBeInTheDocument();
    expect(screen.getByText('Neutral: 0')).toBeInTheDocument();
    
    // Check severity breakdown
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('calculates percentages correctly', () => {
    const events = [
      createMockEvent('resource', 'positive', 'low'),
      createMockEvent('resource', 'negative', 'low'),
      createMockEvent('trade', 'neutral', 'low'),
      createMockEvent('military', 'positive', 'low'),
    ];

    render(<EventStats events={events} onClose={mockOnClose} />);
    
    // Check for percentage display (4 events, each severity should be 25%)
    expect(screen.getByText('(100.0%)')).toBeInTheDocument();
  });

  it('handles events of all categories', () => {
    const events = [
      createMockEvent('resource'),
      createMockEvent('trade'),
      createMockEvent('development'),
      createMockEvent('military'),
      createMockEvent('infrastructure'),
    ];

    render(<EventStats events={events} onClose={mockOnClose} />);
    
    expect(screen.getByText('Resource Events')).toBeInTheDocument();
    expect(screen.getByText('Trade Events')).toBeInTheDocument();
    expect(screen.getByText('Development Events')).toBeInTheDocument();
    expect(screen.getByText('Military Events')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure Events')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<EventStats events={[]} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close statistics');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles empty events array', () => {
    render(<EventStats events={[]} onClose={mockOnClose} />);
    
    expect(screen.getByText('Event Statistics')).toBeInTheDocument();
    expect(screen.getByText('Events by Category')).toBeInTheDocument();
    expect(screen.getByText('Events by Severity')).toBeInTheDocument();
  });

  it('shows all event types in category breakdown', () => {
    const events = [
      createMockEvent('resource', 'positive'),
      createMockEvent('resource', 'negative'),
      createMockEvent('resource', 'neutral'),
    ];

    render(<EventStats events={events} onClose={mockOnClose} />);
    
    expect(screen.getByText('Total: 3')).toBeInTheDocument();
    expect(screen.getByText('Positive: 1')).toBeInTheDocument();
    expect(screen.getByText('Negative: 1')).toBeInTheDocument();
    expect(screen.getByText('Neutral: 1')).toBeInTheDocument();
  });
});