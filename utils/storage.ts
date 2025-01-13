interface GameState {
  diceRollerState: {
    discardCount: number;
    useSpecialDie: boolean;
    eventChance: number;
  };
  barbarianState: {
    currentProgress: number;
    maxProgress: number;
    isAttacking: boolean;
    knights: number;
    attackHistory: Array<{
      timestamp: number;
      knightsAtAttack: number;
    }>;
  };
  gameStatistics: {
    rollCount: number;
    totalPips: number;
    numbersRolled: Record<number, number>;
    specialFacesRolled: Record<string, number>;
    eventsTriggered: number;
    barbarianAttacks: number;
    lastUpdated: number;
  };
  settings: {
    soundEnabled: boolean;
    autoDismissEvents: boolean;
    theme: 'light' | 'dark' | 'system';
    animationsEnabled: boolean;
  };
}

const STORAGE_KEY = 'catan-companion-state';

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

export const getDefaultGameState = (): GameState => ({
  diceRollerState: {
    discardCount: 4,
    useSpecialDie: false,
    eventChance: 15
  },
  barbarianState: {
    currentProgress: 0,
    maxProgress: 7,
    isAttacking: false,
    knights: 0,
    attackHistory: []
  },
  gameStatistics: {
    rollCount: 0,
    totalPips: 0,
    numbersRolled: {},
    specialFacesRolled: {},
    eventsTriggered: 0,
    barbarianAttacks: 0,
    lastUpdated: Date.now()
  },
  settings: {
    soundEnabled: true,
    autoDismissEvents: false,
    theme: 'system',
    animationsEnabled: true
  }
});