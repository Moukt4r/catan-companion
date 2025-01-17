/**
 * @jest-environment jsdom
 */
import { StorageManager } from '../storage';

// Mock localStorage
const mockStorage = new Map<string, string>();
const mockLocalStorage = {
  getItem: jest.fn((key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn((key: string, value: string) => mockStorage.set(key, value)),
  removeItem: jest.fn((key: string) => mockStorage.delete(key)),
  clear: jest.fn(() => mockStorage.clear()),
  length: 0,
  key: jest.fn((index: number) => Array.from(mockStorage.keys())[index])
};

// Replace localStorage
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock navigator.storage
let storageMock = {
  estimate: jest.fn().mockResolvedValue({ quota: 1000, usage: 500 })
};
Object.defineProperty(navigator, 'storage', {
  value: storageMock,
  configurable: true,
  writable: true
});

// Fixed timestamp for tests
const MOCK_NOW = 1600000000000;
jest.spyOn(Date, 'now').mockImplementation(() => MOCK_NOW);

// Helper function
function createMockGameState(overwrites = {}) {
  return {
    version: 1,
    lastSaved: MOCK_NOW,
    settings: {
      autoSave: true,
      theme: 'dark'
    },
    gameData: {
      score: 0,
      resources: []
    },
    ...overwrites
  };
}

describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    // Reset all mocks and storage
    jest.clearAllMocks();
    mockStorage.clear();
    storageMock.estimate.mockClear();
    storageMock.estimate.mockResolvedValue({ quota: 1000, usage: 500 });
    manager = StorageManager.getInstance();
  });

  describe('singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = StorageManager.getInstance();
      const instance2 = StorageManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('saveGameState', () => {
    it('saves state to localStorage', async () => {
      const state = createMockGameState();
      await manager.saveGameState(state);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'catan-companion-state',
        expect.any(String)
      );

      const savedData = JSON.parse(mockLocalStorage.getItem('catan-companion-state'));
      expect(savedData.data).toEqual(state);
    });

    it('handles storage quota errors', async () => {
      storageMock.estimate.mockResolvedValueOnce({ quota: 1000, usage: 999 });

      const state = createMockGameState();
      await expect(manager.saveGameState(state)).rejects.toThrow('Storage quota exceeded');
    });

    it('notifies subscribers of state changes', async () => {
      const subscriber = jest.fn();
      manager.subscribe(subscriber);

      const state = createMockGameState();
      await manager.saveGameState(state);

      expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
        version: expect.any(Number),
        settings: expect.any(Object)
      }));
    });

    it('handles quota exceeded errors and tries to clear old data', async () => {
      // Save some old data first
      const oldState = createMockGameState({ lastSaved: MOCK_NOW - 1000000 });
      await manager.saveGameState(oldState);

      // Mock quota exceeded on next save
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        const error = new Error('Quota exceeded');
        Object.defineProperty(error, 'name', { value: 'QuotaExceededError' });
        throw error;
      });

      const newState = createMockGameState();
      await expect(manager.saveGameState(newState)).rejects.toThrow('Quota exceeded');
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('loadGameState', () => {
    it('loads saved state', async () => {
      const state = createMockGameState();
      await manager.saveGameState(state);
      
      const loadedState = manager.loadGameState();
      expect(loadedState).toEqual(state);
    });

    it('returns null when no state exists', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      expect(manager.loadGameState()).toBeNull();
    });

    it('handles corrupted data', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid json');
      expect(manager.loadGameState()).toBeNull();
    });

    it('migrates old data formats', async () => {
      const oldState = {
        version: 0,
        data: {
          settings: {},
          gameData: {}
        }
      };

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(oldState));
      
      const loadedState = manager.loadGameState();
      expect(loadedState).toEqual(expect.objectContaining({
        version: 1,
        settings: expect.objectContaining({
          autoSave: true
        })
      }));
    });
  });

  describe('data import/export', () => {
    it('exports state as JSON string', async () => {
      const state = createMockGameState();
      await manager.saveGameState(state);

      const exported = manager.exportData();
      expect(JSON.parse(exported)).toEqual(state);
    });

    it('returns empty string when no state exists', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      expect(manager.exportData()).toBe('');
    });

    it('imports valid data', async () => {
      const state = createMockGameState();
      const success = await manager.importData(JSON.stringify(state));
      
      expect(success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('rejects invalid data', async () => {
      const success = await manager.importData('invalid json');
      expect(success).toBe(false);
    });
  });

  describe('subscription management', () => {
    it('allows subscribing and unsubscribing', async () => {
      const subscriber = jest.fn();
      const unsubscribe = manager.subscribe(subscriber);

      const state = createMockGameState();
      await manager.saveGameState(state);
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();
      await manager.saveGameState(state);
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('handles localStorage errors', async () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const state = createMockGameState();
      await expect(manager.saveGameState(state)).rejects.toThrow();
    });

    it('handles estimate API errors', async () => {
      storageMock.estimate.mockRejectedValueOnce(new Error('API error'));
      
      const state = createMockGameState();
      await manager.saveGameState(state);  // Should still try to save
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });
});