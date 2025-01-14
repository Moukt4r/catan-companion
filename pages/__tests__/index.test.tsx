import { render, screen, fireEvent, act } from '@/test-utils';
import Home from '../index';

describe('Home', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset any mocks
    jest.clearAllMocks();
  });

  it('starts with the StartScreen component', () => {
    render(<Home />);
    expect(screen.getByText('Start New Game')).toBeInTheDocument();
  });

  it('transitions to GameScreen when game starts', async () => {
    render(<Home />);
    
    // Configure and start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Should show GameScreen
    expect(await screen.findByText('Roll Dice (Press R)')).toBeInTheDocument();
    expect(screen.getByText('Players')).toBeInTheDocument();
  });

  it('handles player turn progression', async () => {
    render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Wait for GameScreen
    await screen.findByText('Roll Dice (Press R)');
    
    // End current turn
    const endTurnButton = screen.getByText('End Turn');
    fireEvent.click(endTurnButton);
    
    // Should update turn stats
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });

  it('maintains player statistics across turns', async () => {
    render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Wait for GameScreen
    await screen.findByText('Roll Dice (Press R)');
    
    // Roll dice
    const rollButton = screen.getByText('Roll Dice (Press R)');
    fireEvent.click(rollButton);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });
    
    // Check if stats are updated
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('persists game state between renders', async () => {
    const { rerender } = render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Wait for GameScreen
    await screen.findByText('Roll Dice (Press R)');
    
    // Re-render component
    rerender(<Home />);
    
    // Game state should be maintained
    expect(screen.getByText('Roll Dice (Press R)')).toBeInTheDocument();
  });
});
