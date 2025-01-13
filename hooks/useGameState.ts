import { useState, useCallback } from 'react';
import { DiceRoller } from '../utils/diceRoller';
import { BarbarianTracker } from '../utils/barbarianTracker';
import { EventSystem } from '../utils/eventSystem';
import type { GameEvent } from '../types/eventTypes';
import type { DiceRoll } from '../types/diceTypes';

interface GameState {
  diceRoll: DiceRoll | null;
  currentEvent: GameEvent | null;
  barbarianProgress: number;
  isRolling: boolean;
  settings: {
    useSpecialDie: boolean;
    eventChance: number;
    barbarianMax: number;
  };
}

interface GameActions {
  roll: () => Promise<DiceRoll>;
  toggleSpecialDie: (enabled: boolean) => void;
  setEventChance: (chance: number) => void;
  setBarbariansMax: (max: number) => void;
  resetBarbarians: () => void;
}

export function useGameState() {
  const [diceRoller] = useState(() => new DiceRoller());
  const [eventSystem] = useState(() => new EventSystem());
  const [barbarianTracker] = useState(() => new BarbarianTracker());
  
  const [state, setState] = useState<GameState>({
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

  const roll = useCallback(async () => {
    setState(prev => ({ ...prev, isRolling: true }));
    
    // Add delay for animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roll = diceRoller.roll();
    const event = eventSystem.checkForEvent();
    
    if (roll.specialDie === 'barbarian') {
      barbarianTracker.advance();
    }
    
    setState(prev => ({
      ...prev,
      diceRoll: roll,
      currentEvent: event,
      isRolling: false
    }));
    
    return roll;
  }, [diceRoller, eventSystem, barbarianTracker]);

  const toggleSpecialDie = useCallback((enabled: boolean) => {
    diceRoller.setUseSpecialDie(enabled);
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, useSpecialDie: enabled }
    }));
  }, [diceRoller]);

  const setEventChance = useCallback((chance: number) => {
    eventSystem.setEventChance(chance);
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, eventChance: chance }
    }));
  }, [eventSystem]);

  const setBarbariansMax = useCallback((max: number) => {
    barbarianTracker.setMaxProgress(max);
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, barbarianMax: max }
    }));
  }, [barbarianTracker]);

  const resetBarbarians = useCallback(() => {
    barbarianTracker.reset();
    setState(prev => ({ ...prev, barbarianProgress: 0 }));
  }, [barbarianTracker]);

  return {
    state,
    actions: {
      roll,
      toggleSpecialDie,
      setEventChance,
      setBarbariansMax,
      resetBarbarians
    }
  };
}