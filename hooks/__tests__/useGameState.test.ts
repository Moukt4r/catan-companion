import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';

// Mock the utility classes
jest.mock('../utils/diceRoller', () => ({
  DiceRoller: jest.fn().mockImplementation(() => ({
    roll: jest.fn().mockReturnValue({ 
      dice: [1, 2], 
      total: 3, 
      specialDie: 'barbarian'
    }),
    setUseSpecialDie: jest.fn()
  }))
}));

jest.mock('../utils/barbarianTracker', () => ({
  BarbarianTracker: jest.fn().mockImplementation(() => ({
    advance: jest.fn(),
    setMaxProgress: jest.fn(),
    reset: jest.fn()
  }))
}));

jest.mock('../utils/eventSystem', () => ({
  EventSystem: jest.fn().mockImplementation(() => ({
    checkForEvent: jest.fn().mockReturnValue({
      id: 'test-event',
      type: 'positive',
      description: 'Test event'
    }),
    setEventChance: jest.fn()
  }))
}));

describe('useGameState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.state).toEqual({
      diceRoll: null,
      currentEvent: null,
      barbarianProgress: 0,
      isRolling: false,
      settings: {
        useSpecialDie: false,
        eventChance: 15,
        barbarianMax: 7
      }
    });
  });

  it('should handle dice rolling', async () => {
    const { result } = renderHook(() => useGameState());

    jest.useFakeTimers();

    const rollPromise = act(async () => {
      const rollResult = result.current.actions.roll();
      jest.advanceTimersByTime(600);
      return rollResult;
    });

    expect(result.current.state.isRolling).toBe(true);

    const roll = await rollPromise;

    expect(roll).toEqual({
      dice: [1, 2],
      total: 3,
      specialDie: 'barbarian'
    });

    expect(result.current.state.isRolling).toBe(false);
    expect(result.current.state.diceRoll).toEqual(roll);
    expect(result.current.state.currentEvent).toEqual({
      id: 'test-event',
      type: 'positive',
      description: 'Test event'
    });

    jest.useRealTimers();
  });

  it('should toggle special die setting', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.actions.toggleSpecialDie(true);
    });

    expect(result.current.state.settings.useSpecialDie).toBe(true);
  });

  it('should update event chance', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.actions.setEventChance(25);
    });

    expect(result.current.state.settings.eventChance).toBe(25);
  });

  it('should update barbarians max', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.actions.setBarbariansMax(10);
    });

    expect(result.current.state.settings.barbarianMax).toBe(10);
  });

  it('should reset barbarians', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.actions.resetBarbarians();
    });

    expect(result.current.state.barbarianProgress).toBe(0);
  });

  it('should advance barbarian tracker when rolling barbarian', async () => {
    const { result } = renderHook(() => useGameState());
    const mockAdvance = jest.fn();

    // Override the mock implementation for this specific test
    (BarbarianTracker as jest.Mock).mockImplementation(() => ({
      advance: mockAdvance,
      setMaxProgress: jest.fn(),
      reset: jest.fn()
    }));

    jest.useFakeTimers();

    await act(async () => {
      const rollPromise = result.current.actions.roll();
      jest.advanceTimersByTime(600);
      await rollPromise;
    });

    expect(mockAdvance).toHaveBeenCalled();

    jest.useRealTimers();
  });
});