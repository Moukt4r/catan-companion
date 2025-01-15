import { StorageManager } from '../storage';
import { debounce } from 'lodash';

// Mock lodash debounce to execute immediately in tests
jest.mock('lodash', () => ({
  debounce: (fn: Function) => fn
}));

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  }),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true
});

// Mock navigator.storage
const mockStorageEstimate = jest.fn().mockResolvedValue({ quota: 100000, usage: 50000 });
Object.defineProperty(window.navigator, 'storage', {
  value: {
    estimate: mockStorageEstimate
  },
  writable: true,
  configurable: true
});

// Mock console.error to avoid test pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('StorageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockStorageEstimate.mockResolvedValue({ quota: 100000, usage: 50000 });
  });

  const createMockGameState = (overrides = {}) => ({
    version: 1,
    lastSaved: Date.now(),
    settings: {
      autoSave: true
    },
    ...overrides
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = StorageManager.getInstance();
      const instance2 = StorageManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('saveGameState', () => {
    it('should handle storage quota errors', async () => {
      mockStorageEstimate.mockResolvedValueOnce({ quota: 100, usage: 99 });
      const manager = StorageManager.getInstance();

      await expect(manager.saveGameState(createMockGameState()))
        .rejects
        .toThrow('Storage quota exceeded');
    });

    it('should notify subscribers when state is saved', async () => {
      const manager = StorageManager.getInstance();
      const mockSubscriber = jest.fn();
      manager.subscribe(mockSubscriber);

      await manager.saveGameState(createMockGameState());
      expect(mockSubscriber).toHaveBeenCalled();
    });

    it('should save with updated timestamp', async () => {
      const manager = StorageManager.getInstance();
      const state = createMockGameState();
      const beforeSave = Date.now();
      
      await manager.saveGameState(state);

      const savedData = JSON.parse(mockLocalStorage.store['catan-companion-state']);
      expect(savedData.data.lastSaved).toBeGreaterThanOrEqual(beforeSave);
    });
  });

  describe('loadGameState', () => {
    it('should load game state from localStorage', () => {
      const manager = StorageManager.getInstance();
      const state = createMockGameState();
      mockLocalStorage.setItem('catan-companion-state', JSON.stringify({
        version: 1,
        data: state
      }));

      const loadedState = manager.loadGameState();
      expect(loadedState).toEqual(state);
    });

    it('should return null if no state exists', () => {
      const manager = StorageManager.getInstance();
      const loadedState = manager.loadGameState();
      expect(loadedState).toBeNull();
    });

    it('should handle invalid JSON', () => {
      const manager = StorageManager.getInstance();
      mockLocalStorage.setItem('catan-companion-state', 'invalid-json');

      const loadedState = manager.loadGameState();
      expect(loadedState).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should migrate old state versions', async () => {
      const manager = StorageManager.getInstance();
      const oldState = createMockGameState({ version: 0, settings: {} });
      mockLocalStorage.setItem('catan-companion-state', JSON.stringify({
        version: 0,
        data: oldState
      }));

      const loadedState = manager.loadGameState();
      expect(loadedState?.version).toBe(1);
      expect(loadedState?.settings?.autoSave).toBe(true);
    });
  });

  describe('clearGameState', () => {
    it('should remove state from localStorage', () => {
      const manager = StorageManager.getInstance();
      manager.clearGameState();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('catan-companion-state');
    });

    it('should notify subscribers when state is cleared', () => {
      const manager = StorageManager.getInstance();
      const mockSubscriber = jest.fn();
      manager.subscribe(mockSubscriber);

      manager.clearGameState();
      expect(mockSubscriber).toHaveBeenCalledWith({});
    });

    it('should handle localStorage errors', () => {
      const manager = StorageManager.getInstance();
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => manager.clearGameState()).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('subscription management', () => {
    it('should handle subscribe and unsubscribe', async () => {
      const manager = StorageManager.getInstance();
      const mockSubscriber = jest.fn();

      const unsubscribe = manager.subscribe(mockSubscriber);
      await manager.saveGameState(createMockGameState());
      expect(mockSubscriber).toHaveBeenCalled();

      unsubscribe();
      jest.clearAllMocks();
      await manager.saveGameState(createMockGameState());
      expect(mockSubscriber).not.toHaveBeenCalled();
    });
  });

  describe('data import/export', () => {
    it('should export current state', () => {
      const manager = StorageManager.getInstance();
      const state = createMockGameState();
      mockLocalStorage.setItem('catan-companion-state', JSON.stringify({
        version: 1,
        data: state
      }));

      const exportedData = manager.exportData();
      expect(JSON.parse(exportedData)).toEqual(state);
    });

    it('should return empty string when no state exists', () => {
      const manager = StorageManager.getInstance();
      const exportedData = manager.exportData();
      expect(exportedData).toBe('');
    });

    it('should import valid state data', async () => {
      const manager = StorageManager.getInstance();
      const state = createMockGameState();

      const success = await manager.importData(JSON.stringify(state));
      expect(success).toBe(true);
    });

    it('should reject invalid import data', async () => {
      const manager = StorageManager.getInstance();

      const success = await manager.importData('invalid-json');
      expect(success).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle failed import validation', async () => {
      const manager = StorageManager.getInstance();
      const invalidState = { version: 'invalid' };

      const success = await manager.importData(JSON.stringify(invalidState));
      expect(success).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors during save', async () => {
      const manager = StorageManager.getInstance();
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      await expect(manager.saveGameState(createMockGameState())).rejects.toThrow('Storage error');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle quota exceeded errors and try to clear old data', async () => {
      const manager = StorageManager.getInstance();
      const oldState = createMockGameState({ lastSaved: Date.now() - 1000 });
      mockLocalStorage.setItem('catan-companion-state', JSON.stringify({
        version: 1,
        data: oldState
      }));

      // First call throws quota error, second succeeds
      mockLocalStorage.setItem
        .mockImplementationOnce(() => {
          const error = new Error('Quota exceeded');
          error.name = 'QuotaExceededError';
          throw error;
        })
        .mockImplementationOnce(() => {});

      await manager.saveGameState(createMockGameState());
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    it('should handle estimate API errors', async () => {
      const manager = StorageManager.getInstance();
      mockStorageEstimate.mockRejectedValueOnce(new Error('API error'));

      // Should still try to save even if estimate fails
      await manager.saveGameState(createMockGameState());
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });
});