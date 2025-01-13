import { debounce } from 'lodash';

interface StorageState {
  version: number;
  data: GameState;
}

interface GameState {
  // ... previous GameState interface ...
  version: number;
  lastSaved: number;
}

const CURRENT_VERSION = 1;
const STORAGE_KEY = 'catan-companion-state';
const SAVE_DEBOUNCE_MS = 1000;

const migrations: Record<number, (state: any) => any> = {
  1: (oldState: any) => ({
    ...oldState,
    version: 1,
    settings: {
      ...oldState.settings,
      autoSave: true
    }
  })
};

const runMigrations = (state: any, fromVersion: number): GameState => {
  let currentState = state;
  for (let version = fromVersion + 1; version <= CURRENT_VERSION; version++) {
    if (migrations[version]) {
      currentState = migrations[version](currentState);
    }
  }
  return currentState;
};

class StorageManager {
  private static instance: StorageManager;
  private subscribers: Set<(state: GameState) => void>;

  private constructor() {
    this.subscribers = new Set();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private async checkQuota(): Promise<boolean> {
    if (navigator.storage && navigator.storage.estimate) {
      const { quota, usage } = await navigator.storage.estimate();
      return quota ? usage! < quota : true;
    }
    return true;
  }

  public subscribe(callback: (state: GameState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(state: GameState): void {
    this.subscribers.forEach(callback => callback(state));
  }

  public saveGameState = debounce(async (state: GameState): Promise<void> => {
    try {
      const hasQuota = await this.checkQuota();
      if (!hasQuota) {
        throw new Error('Storage quota exceeded');
      }

      const storageState: StorageState = {
        version: CURRENT_VERSION,
        data: {
          ...state,
          lastSaved: Date.now(),
          version: CURRENT_VERSION
        }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageState));
      this.notifySubscribers(storageState.data);
    } catch (error) {
      console.error('Failed to save game state:', error);
      // If it's a quota error, try to clear old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldData();
      }
      throw error;
    }
  }, SAVE_DEBOUNCE_MS);

  private clearOldData(): void {
    try {
      const keys = Object.keys(localStorage);
      const oldestKey = keys.reduce((oldest, key) => {
        const item = localStorage.getItem(key);
        if (!item) return oldest;
        
        try {
          const { data } = JSON.parse(item);
          return !oldest || data.lastSaved < oldest.lastSaved ? { key, lastSaved: data.lastSaved } : oldest;
        } catch {
          return oldest;
        }
      }, null as { key: string; lastSaved: number } | null);

      if (oldestKey) {
        localStorage.removeItem(oldestKey.key);
      }
    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  }

  public loadGameState(): GameState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const { version, data }: StorageState = JSON.parse(stored);
      
      if (version < CURRENT_VERSION) {
        const migratedState = runMigrations(data, version);
        this.saveGameState(migratedState);
        return migratedState;
      }

      return data;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  public exportData(): string {
    const state = this.loadGameState();
    return state ? JSON.stringify(state) : '';
  }

  public async importData(data: string): Promise<boolean> {
    try {
      const importedState = JSON.parse(data);
      // Validate imported data
      if (!this.validateGameState(importedState)) {
        throw new Error('Invalid game state data');
      }
      
      await this.saveGameState(importedState);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  private validateGameState(state: any): state is GameState {
    return (
      typeof state === 'object' &&
      state !== null &&
      typeof state.version === 'number' &&
      typeof state.lastSaved === 'number' &&
      // Add more validation as needed
      true
    );
  }

  public clearGameState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.notifySubscribers({} as GameState);
    } catch (error) {
      console.error('Failed to clear game state:', error);
    }
  }
}