import { jest } from '@jest/globals';
import { StorageManager } from '../storage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock storage quota API
Object.defineProperty(window.navigator, 'storage', {
  value: {
    estimate: jest.fn().mockResolvedValue({ quota: 100000000, usage: 50000000 }),
  },
});

const createMockGameState = () => ({
  version: 1,
  lastSaved: Date.now(),
  settings: {
    autoSave: true,
  },
  events: [],
});

describe('StorageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  it('should be a singleton', () => {
    const instance1 = StorageManager.getInstance();
    const instance2 = StorageManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('saveGameState', () => {
    it('should save game state to localStorage', async () => {
      const manager = StorageManager.getInstance();
      const state = createMockGameState();
      await manager.saveGameState(state);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData.version).toBe(1);
      expect(savedData.data.settings.autoSave).toBe(true);
    });

    it('should handle storage quota errors', async () => {
      const manager = StorageManager.getInstance();
      
      // Mock storage quota exceeded
      Object.defineProperty(window.navigator, 'storage', {
        value: {
          estimate: jest.fn().mockResolvedValue({ quota: 1000, usage: 999 }),
        },
      });

      await expect(manager.saveGameState(createMockGameState()))
        .rejects
        .toThrow('Storage quota exceeded');
    });

    it('should notify subscribers after saving', async () => {
      const manager = StorageManager.getInstance();
      const subscriber = jest.fn();
      
      manager.subscribe(subscriber);
      await manager.saveGameState(createMockGameState());

      expect(subscriber).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle quota exceeded errors and try to clear old data', async () => {
      const manager = StorageManager.getInstance();
      
      // Mock localStorage quota exceeded
      mockLocalStorage.setItem
        .mockImplementationOnce(() => {
          const error = new Error('Quota exceeded');
          error.name = 'QuotaExceededError';
          throw error;
        })
        .mockImplementationOnce(() => {
          // Second attempt succeeds after clearing old data
          return undefined;
        });

      // Mock clearOldData implementation
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        version: 1,
        data: { lastSaved: Date.now() - 10000 }
      }));

      await expect(manager.saveGameState(createMockGameState())).resolves.toBeUndefined();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    it('should gracefully handle failed imports', async () => {
      const manager = StorageManager.getInstance();
      const result = await manager.importData('invalid json');
      expect(result).toBe(false);
    });
  });

  describe('data migration', () => {
    it('should migrate old data formats', () => {
      const manager = StorageManager.getInstance();
      const oldState = {
        version: 0,
        data: {
          settings: {},
        }
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldState));
      
      const loadedState = manager.loadGameState();
      expect(loadedState?.version).toBe(1);
      expect(loadedState?.settings.autoSave).toBe(true);
    });
  });

  describe('data validation', () => {
    it('should validate imported data', async () => {
      const manager = StorageManager.getInstance();
      
      // Invalid state missing required fields
      const invalidState = JSON.stringify({ foo: 'bar' });
      expect(await manager.importData(invalidState)).toBe(false);

      // Valid state
      const validState = JSON.stringify({
        version: 1,
        lastSaved: Date.now(),
        settings: { autoSave: true }
      });
      expect(await manager.importData(validState)).toBe(true);
    });
  });
});