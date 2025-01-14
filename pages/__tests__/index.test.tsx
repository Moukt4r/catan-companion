import { render, screen, fireEvent, act } from '@/test-utils';
import Home from '../index';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Users: () => <span data-testid="users-icon" />,
  User: () => <span data-testid="user-icon" />,
  Plus: () => <span data-testid="plus-icon" />,
  Minus: () => <span data-testid="minus-icon" />,
  Crown: () => <span data-testid="crown-icon" />,
  Award: () => <span data-testid="award-icon" />,
  ChevronRight: () => <span data-testid="chevron-right-icon" />,
}));

describe('Home', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
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
    expect(await screen.findByText(/roll the dice/i)).toBeInTheDocument();
    expect(screen.getByText(/players/i)).toBeInTheDocument();
  });

  it('handles player turn progression', async () => {
    render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // End current turn
    const endTurnButton = await screen.findByText('End Turn');
    fireEvent.click(endTurnButton);
    
    // Should update turn stats
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });

  it('maintains player statistics across turns', async () => {
    render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Roll dice
    const rollButton = await screen.findByText(/roll dice/i, { exact: false });
    fireEvent.click(rollButton);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });
    
    // Check if stats are updated
    expect(screen.getByText(/Rolls: 1/i)).toBeInTheDocument();
  });

  it('persists game state between renders', async () => {
    const { rerender } = render(<Home />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Wait for GameScreen to appear
    await screen.findByText(/roll the dice/i);
    
    // Re-render component
    rerender(<Home />);
    
    // Game state should be maintained
    expect(screen.getByText(/roll the dice/i)).toBeInTheDocument();
  });
});
