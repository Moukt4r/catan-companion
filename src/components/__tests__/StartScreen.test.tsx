import { render, screen, fireEvent } from '@/test-utils';
import StartScreen from '../StartScreen';
import { PLAYER_COLORS } from '@/types/playerTypes';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Users: () => <span data-testid="users-icon" />,
  User: () => <span data-testid="user-icon" />,
  Plus: () => <span data-testid="plus-icon" />,
  Minus: () => <span data-testid="minus-icon" />,
}));

describe('StartScreen', () => {
  const mockOnStartGame = jest.fn();

  beforeEach(() => {
    mockOnStartGame.mockClear();
  });

  it('renders with default 4 players', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    // Check if we have 4 player inputs
    const playerInputs = screen.getAllByPlaceholderText(/Player \d/);
    expect(playerInputs).toHaveLength(4);

    // Check if we have 4 color selectors
    const colorSelects = screen.getAllByRole('combobox');
    expect(colorSelects).toHaveLength(4);
  });

  it('allows adding players up to 6', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    const addButton = screen.getByLabelText(/increase player count/i);
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    
    const playerInputs = screen.getAllByPlaceholderText(/Player \d/);
    expect(playerInputs).toHaveLength(6);
    
    // Should be disabled at max players
    expect(addButton).toBeDisabled();
  });

  it('allows reducing players down to 2', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    const minusButton = screen.getByLabelText(/decrease player count/i);
    fireEvent.click(minusButton);
    fireEvent.click(minusButton);
    
    const playerInputs = screen.getAllByPlaceholderText(/Player \d/);
    expect(playerInputs).toHaveLength(2);
    
    // Should be disabled at min players
    expect(minusButton).toBeDisabled();
  });

  it('allows updating player names', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    const firstPlayerInput = screen.getByPlaceholderText('Player 1');
    fireEvent.change(firstPlayerInput, { target: { value: 'Alice' } });
    
    expect(firstPlayerInput).toHaveValue('Alice');
  });

  it('allows updating player colors', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    const firstColorSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(firstColorSelect, { target: { value: 'blue' } });
    
    expect(firstColorSelect).toHaveValue('blue');
  });

  it('starts game with correct player data', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    // Update first player
    const firstPlayerInput = screen.getByPlaceholderText('Player 1');
    fireEvent.change(firstPlayerInput, { target: { value: 'Alice' } });
    
    const firstColorSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(firstColorSelect, { target: { value: 'blue' } });
    
    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);
    
    // Check if onStartGame was called with correct data
    expect(mockOnStartGame).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'player-1',
          name: 'Alice',
          color: 'blue',
          statistics: expect.any(Object)
        })
      ])
    );
  });
});
