import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';

const mockBarbarianAdvance = jest.fn();
const mockBarbarianSetMax = jest.fn();
const mockBarbarianReset = jest.fn();

// Mock the utility classes
jest.mock('../../utils/diceRoller', () => ({
  DiceRoller: jest.fn().mockImplementation(() => ({
    roll: jest.fn().mockReturnValue({ 
      dice: [1, 2], 
      total: 3, 
      specialDie: 'barbarian'
    }),
    setUseSpecialDie: jest.fn()
  }))
}));

jest.mock('../../utils/barbarianTracker', () => ({
  BarbarianTracker: jest.fn().mockImplementation(() => ({
    advance: mockBarbarianAdvance,
    setMaxProgress: mockBarbarianSetMax,
    reset: mockBarbarianReset
  }))
}));

jest.mock('../../utils/eventSystem', () => ({
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

    let rollValue;
    await act(async () => {
      const rollPromise = result.current.actions.roll();
      await jest.runAllTimers();
      rollValue = await rollPromise;
    });

    expect(rollValue).toEqual({
      dice: [1, 2],
      total: 3,
      specialDie: 'barbarian'
    });

    expect(result.current.state.diceRoll).toEqual(rollValue);
    expect(result.current.state.currentEvent).toEqual({
      id: 'test-event',
      type: 'positive',
      description: 'Test event'
    });

    jest.useRealTimers();
  });

  it('should toggle special die setting', async () => {
    const { result } = renderHook(() => useGameState());

    await act(async () => {
      result.current.actions.toggleSpecialDie(true);
    });

    expect(result.current.state.settings.useSpecialDie).toBe(true);
  });

  it('should update event chance', async () => {
    const { result } = renderHook(() => useGameState());

    await act(async () => {
      result.current.actions.setEventChance(25);
    });

    expect(result.current.state.settings.eventChance).toBe(25);
  });

  it('should update barbarians max', async () => {
    const { result } = renderHook(() => useGameState());

    await act(async () => {
      result.current.actions.setBarbariansMax(10);
    });

    expect(result.current.state.settings.barbarianMax).toBe(10);
    expect(mockBarbarianSetMax).toHaveBeenCalledWith(10);
  });

  it('should reset barbarians', async () => {
    const { result } = renderHook(() => useGameState());

    await act(async () => {
      result.current.actions.resetBarbarians();
    });

    expect(result.current.state.barbarianProgress).toBe(0);
    expect(mockBarbarianReset).toHaveBeenCalled();
  });

  it('should advance barbarian tracker when rolling barbarian', async () => {
    const { result } = renderHook(() => useGameState());

    jest.useFakeTimers();

    await act(async () => {
      const rollPromise = result.current.actions.roll();
      await jest.runAllTimers();
      await rollPromise;
    });

    expect(mockBarbarianAdvance).toHaveBeenCalled();

    jest.useRealTimers();
  });
});