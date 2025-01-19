import { StorageManager } from '../storage';

// Mock storage API
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock navigator.storage
const mockStorage = {
  estimate: jest.fn().mockResolvedValue({ quota: 100000000, usage: 50000000 }),
};

beforeAll(() => {
  // Setup global mocks
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  Object.defineProperty(window.navigator, 'storage', {
    value: mockStorage,
    writable: true,
  });
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  mockLocalStorage.getItem.mockReset();
  mockLocalStorage.setItem.mockReset();
  mockLocalStorage.removeItem.mockReset();
  mockStorage.estimate.mockReset().mockResolvedValue({ quota: 100000000, usage: 50000000 });

  // Reset singleton instance
  StorageManager['instance'] = null;
});

describe('StorageManager', () => {
  const createMockGameState = () => ({
    version: 1,
    lastSaved: Date.now(),
    settings: {
      autoSave: true,
    },
    events: [],
  });

  describe('basic operations', () => {
    it('enforces singleton pattern', () => {
      const instance1 = StorageManager.getInstance();
      const instance2 = StorageManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('saves and loads game state', async () => {
      const manager = StorageManager.getInstance();
      const state = createMockGameState();

      await manager.saveGameState(state);

      // Verify local storage was called with correct data
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const [key, value] = mockLocalStorage.setItem.mock.calls[0];
      expect(key).toBe('gameState');
      const savedData = JSON.parse(value);
      expect(savedData.version).toBe(1);
      expect(savedData.data).toBeDefined();
    });

    it('loads non-existent state as null', () => {
      const manager = StorageManager.getInstance();
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = manager.loadGameState();
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('handles storage quota error with retry', async () => {
      const manager = StorageManager.getInstance();
      
      // Set up mock old data to be cleared
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        version: 1,
        lastSaved: Date.now() - 1000000,
        data: createMockGameState()
      }));

      // Mock quota exceeded on first save, success on second
      mockLocalStorage.setItem
        .mockImplementationOnce(() => {
          const error = new Error('Quota exceeded');
          error.name = 'QuotaExceededError';
          throw error;
        })
        .mockImplementationOnce(() => undefined);

      await manager.saveGameState(createMockGameState());
      
      // Should try to clear old data
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('gameState');
    });

    it('handles non-quota storage error without retry', async () => {
      const manager = StorageManager.getInstance();
      
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('Unknown storage error');
        error.name = 'UnknownError';
        throw error;
      });

      await expect(manager.saveGameState(createMockGameState()))
        .rejects.toThrow('Unknown storage error');
      
      // Should not try to clear old data
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('handles external storage error', async () => {
      const manager = StorageManager.getInstance();
      
      mockStorage.estimate.mockImplementation(() => {
        throw new Error('Storage API error');
      });

      await expect(manager.saveGameState(createMockGameState()))
        .rejects.toThrow('Storage API error');
    });

    it('handles corrupt data gracefully', () => {
      const manager = StorageManager.getInstance();
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = manager.loadGameState();
      expect(result).toBeNull();
    });
  });

  describe('data migration', () => {
    it('migrates old data format with settings', () => {
      const manager = StorageManager.getInstance();
      
      // Setup old format data with settings
      const oldData = {
        version: 0,
        data: {
          settings: { theme: 'dark' },
          events: []
        }
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));
      
      const result = manager.loadGameState();
      expect(result?.version).toBe(1);
      expect(result?.settings.autoSave).toBe(true);
      expect(result?.settings.theme).toBe('dark');
    });

    it('migrates old data format without settings', () => {
      const manager = StorageManager.getInstance();
      
      // Setup old format data without settings
      const oldData = {
        version: 0,
        data: {
          events: []
        }
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));
      
      const result = manager.loadGameState();
      expect(result?.version).toBe(1);
      expect(result?.settings.autoSave).toBe(true);
      expect(result?.events).toEqual([]);
    });

    it('handles completely undefined settings in migration', () => {
      const manager = StorageManager.getInstance();
      
      // Setup old format data with undefined settings
      const oldData = {
        version: 0,
        data: {
          settings: undefined,
          events: []
        }
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));
      
      const result = manager.loadGameState();
      expect(result?.version).toBe(1);
      expect(result?.settings.autoSave).toBe(true);
    });
  });

  describe('event notification', () => {
    it('notifies subscribers of state changes', async () => {
      const manager = StorageManager.getInstance();
      const subscriber = jest.fn();
      
      manager.subscribe(subscriber);
      await manager.saveGameState(createMockGameState());
      expect(subscriber).toHaveBeenCalledTimes(1);
      
      manager.unsubscribe(subscriber);
      await manager.saveGameState(createMockGameState());
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe('import/export', () => {
    it('validates imported data', async () => {
      const manager = StorageManager.getInstance();
      
      // Invalid data formats
      expect(await manager.importData('invalid json')).toBe(false);
      expect(await manager.importData(JSON.stringify({}))).toBe(false);
      expect(await manager.importData(JSON.stringify({ version: 1 }))).toBe(false);
      expect(await manager.importData(JSON.stringify({ version: 1, lastSaved: Date.now() }))).toBe(false);
      expect(await manager.importData(JSON.stringify({ 
        version: 1, 
        lastSaved: Date.now(),
        settings: 'not an object'
      }))).toBe(false);
      
      // Valid data
      const validState = createMockGameState();
      expect(await manager.importData(JSON.stringify(validState))).toBe(true);
    });

    it('handles storage errors during import', async () => {
      const manager = StorageManager.getInstance();
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const validState = createMockGameState();
      expect(await manager.importData(JSON.stringify(validState))).toBe(false);
    });
  });
});