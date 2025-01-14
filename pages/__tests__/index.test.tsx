import { render, screen, fireEvent, act } from '@testing-library/react';
import Home from '../index';

describe('Home', () => {
  it('starts with the StartScreen component', () => {
    render(<Home />);
    expect(screen.getByText('Start New Game')).toBeInTheDocument();
  });

  it('transitions to GameScreen when game starts', () => {
    render(<Home />);
    
    // Configure and start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Should show GameScreen
    expect(screen.getByText(/roll the dice/i)).toBeInTheDocument();
    expect(screen.getByText(/players/i)).toBeInTheDocument();
  });

  it('handles player turn progression', () => {
    render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // End current turn
    const endTurnButton = screen.getByText('End Turn');
    fireEvent.click(endTurnButton);
    
    // Should update turn stats
    const secondPlayer = screen.getAllByRole('listitem')[1];
    expect(secondPlayer).toHaveTextContent('Player 2');
  });

  it('maintains player statistics across turns', async () => {
    render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Roll dice
    const rollButton = screen.getByText('Roll Dice (Press R)');
    fireEvent.click(rollButton);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });
    
    // Check if stats are updated
    expect(screen.getByText(/Rolls: 1/)).toBeInTheDocument();
  });

  it('persists game state between renders', () => {
    const { rerender } = render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Re-render component
    rerender(<Home />);
    
    // Game state should be maintained
    expect(screen.getByText(/roll the dice/i)).toBeInTheDocument();
  });
});
