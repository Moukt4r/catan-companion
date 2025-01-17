import { StorageManager } from '../storage';

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock storage quota API
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    storage: {
      estimate: jest.fn().mockResolvedValue({ quota: 100000000, usage: 50000000 }),
    },
  },
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: mockLocalStorage,
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
    StorageManager['instance'] = null; // Reset singleton
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
      const [key, value] = mockLocalStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(value);
      expect(savedData.version).toBe(1);
      expect(savedData.data).toBeDefined();
      expect(savedData.data.settings.autoSave).toBe(true);
    });

    it('should handle storage quota errors', async () => {
      const manager = StorageManager.getInstance();
      
      // Mock quota exceeded error
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      // Set up old data to clear
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        version: 1,
        lastSaved: Date.now() - 1000000,
        data: createMockGameState()
      }));

      // Attempt save, should trigger quota error and clearOldData
      await manager.saveGameState(createMockGameState());
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    it('should notify subscribers after saving', async () => {
      const manager = StorageManager.getInstance();
      const subscriber = jest.fn();
      
      manager.subscribe(subscriber);
      await manager.saveGameState(createMockGameState());

      expect(subscriber).toHaveBeenCalled();
    });
  });

  describe('data migration', () => {
    it('should migrate old data formats', () => {
      const manager = StorageManager.getInstance();
      
      // Mock old data format
      const oldData = {
        version: 0,
        data: {
          settings: {},
          events: []
        }
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));
      
      const loadedState = manager.loadGameState();
      expect(loadedState.version).toBe(1);
      expect(loadedState.settings.autoSave).toBe(true);
    });

    it('should handle corrupted data gracefully', () => {
      const manager = StorageManager.getInstance();
      
      // Mock corrupted data
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const loadedState = manager.loadGameState();
      expect(loadedState).toBeNull();
    });
  });

  describe('data import/export', () => {
    it('should validate imported data', async () => {
      const manager = StorageManager.getInstance();
      
      // Invalid data
      expect(await manager.importData('invalid json')).toBe(false);
      expect(await manager.importData(JSON.stringify({ foo: 'bar' }))).toBe(false);

      // Valid data
      const validState = createMockGameState();
      expect(await manager.importData(JSON.stringify(validState))).toBe(true);
    });

    it('should handle storage errors during import', async () => {
      const manager = StorageManager.getInstance();
      
      // Mock storage error
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      // Should handle error gracefully
      const validState = createMockGameState();
      expect(await manager.importData(JSON.stringify(validState))).toBe(false);
    });
  });

  describe('subscription management', () => {
    it('should handle subscriber lifecycle', () => {
      const manager = StorageManager.getInstance();
      const subscriber = jest.fn();
      
      manager.subscribe(subscriber);
      manager.saveGameState(createMockGameState());
      expect(subscriber).toHaveBeenCalled();

      subscriber.mockClear();
      manager.unsubscribe(subscriber);
      manager.saveGameState(createMockGameState());
      expect(subscriber).not.toHaveBeenCalled();
    });
  });
});