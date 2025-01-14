import { render, screen, fireEvent } from '@testing-library/react';
import { BarbarianTracker } from '../BarbarianTracker';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Swords: () => <span data-testid="swords-icon" />
}));

describe('BarbarianTracker', () => {
  it('initializes with zero progress and knights', () => {
    render(<BarbarianTracker />);
    
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
    // Progress bar should be empty
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('allows adding knights', () => {
    render(<BarbarianTracker />);
    
    const addKnightButton = screen.getByText('Add Knight');
    fireEvent.click(addKnightButton);
    
    expect(screen.getByText('Knights: 1')).toBeInTheDocument();
  });

  it('advances progress on barbarian roll', () => {
    const ref = { current: null };
    render(<BarbarianTracker ref={ref} />);
    
    // Use the ref to advance
    ref.current?.advance();
    
    // Progress bar should show progress
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: `${(1 / 7) * 100}%` });
  });

  it('triggers attack when progress reaches threshold', () => {
    const ref = { current: null };
    render(<BarbarianTracker ref={ref} threshold={3} />);
    
    // Add some knights
    const addKnightButton = screen.getByText('Add Knight');
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    
    // Advance to threshold
    ref.current?.advance();
    ref.current?.advance();
    ref.current?.advance();
    
    // Should show attack history
    expect(screen.getByText('Attack History')).toBeInTheDocument();
    expect(screen.getByText('Defended!')).toBeInTheDocument();
  });

  it('resets knights after attack', () => {
    const ref = { current: null };
    render(<BarbarianTracker ref={ref} threshold={2} />);
    
    // Add knights and trigger attack
    const addKnightButton = screen.getByText('Add Knight');
    fireEvent.click(addKnightButton);
    
    ref.current?.advance();
    ref.current?.advance();
    
    // Knights should be reset
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
  });
});
