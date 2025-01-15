import { StorageManager } from '../storage';

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
  })
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock navigator.storage
const mockStorageEstimate = jest.fn().mockResolvedValue({ quota: 100000, usage: 50000 });
Object.defineProperty(window, 'navigator', {
  value: {
    storage: {
      estimate: mockStorageEstimate
    }
  },
  writable: true
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
    it('should save game state to localStorage', async () => {
      const manager = StorageManager.getInstance();
      const state = createMockGameState();

      await manager.saveGameState(state);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(mockLocalStorage.store['catan-companion-state']);
      expect(savedData.version).toBe(1);
      expect(savedData.data.settings.autoSave).toBe(true);
    });

    it('should handle storage quota errors', async () => {
      const manager = StorageManager.getInstance();
      mockStorageEstimate.mockResolvedValueOnce({ quota: 100, usage: 99 });

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
      expect(mockSubscriber).toHaveBeenCalled();
    });
  });

  describe('subscription management', () => {
    it('should handle subscribe and unsubscribe', () => {
      const manager = StorageManager.getInstance();
      const mockSubscriber = jest.fn();

      const unsubscribe = manager.subscribe(mockSubscriber);
      manager.saveGameState(createMockGameState());
      expect(mockSubscriber).toHaveBeenCalled();

      unsubscribe();
      jest.clearAllMocks();
      manager.saveGameState(createMockGameState());
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
    });
  });
});