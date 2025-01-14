import { render, screen, fireEvent } from '@testing-library/react';
import { StartScreen } from '../StartScreen';
import { PLAYER_COLORS } from '@/types/playerTypes';

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
    
    const addButton = screen.getByRole('button', { name: /\+/i });
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    
    const playerInputs = screen.getAllByPlaceholderText(/Player \d/);
    expect(playerInputs).toHaveLength(6);
    
    // Should be disabled at max players
    expect(addButton).toBeDisabled();
  });

  it('allows reducing players down to 2', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    const minusButton = screen.getByRole('button', { name: /\-/i });
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

  it('validates min/max player counts', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    // Try to go below min
    const minusButton = screen.getByRole('button', { name: /\-/i });
    for (let i = 0; i < 5; i++) {
      fireEvent.click(minusButton);
    }
    expect(screen.getAllByPlaceholderText(/Player \d/)).toHaveLength(2);

    // Try to go above max
    const addButton = screen.getByRole('button', { name: /\+/i });
    for (let i = 0; i < 10; i++) {
      fireEvent.click(addButton);
    }
    expect(screen.getAllByPlaceholderText(/Player \d/)).toHaveLength(6);
  });

  it('ensures unique colors for all players', () => {
    render(<StartScreen onStartGame={mockOnStartGame} />);
    
    const colorSelects = screen.getAllByRole('combobox');
    const selectedColors = colorSelects.map(select => select.value);
    
    // Check if all colors are unique
    const uniqueColors = new Set(selectedColors);
    expect(uniqueColors.size).toBe(selectedColors.length);
  });
});
