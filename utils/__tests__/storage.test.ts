import { StorageManager } from '../storage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

// Create a proper mock of the Storage API
class MockStorage implements Storage {
  private store: { [key: string]: string } = {};
  length = 0;
  
  clear(): void {
    this.store = {};
    this.length = 0;
    mockLocalStorage.clear();
  }

  getItem(key: string): string | null {
    mockLocalStorage.getItem(key);
    return this.store[key] || null;
  }

  key(index: number): string | null {
    mockLocalStorage.key(index);
    return Object.keys(this.store)[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
    mockLocalStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
    this.length = Object.keys(this.store).length;
    mockLocalStorage.setItem(key, value);
  }
}

const mockStorageInstance = new MockStorage();

Object.defineProperty(window, 'localStorage', {
  value: mockStorageInstance
});

// Mock storage estimation API
const mockStorageEstimate = jest.fn().mockResolvedValue({ quota: 1000, usage: 500 });

// Helper function to create a mock game state
const createMockGameState = () => ({
  version: 1,
  lastSaved: Date.now(),
  settings: {
    autoSave: true,
    theme: 'dark'
  },
  gameData: {
    score: 0,
    resources: []
  }
});

describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    mockLocalStorage.removeItem.mockReset();
    
    // Reset storage estimate mock
    mockStorageEstimate.mockReset();
    mockStorageEstimate.mockResolvedValue({ quota: 1000, usage: 500 });
    
    // Reset navigator.storage mock
    Object.defineProperty(window.navigator, 'storage', {
      value: {
        estimate: mockStorageEstimate
      },
      configurable: true,
      writable: true
    });
    
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
    it('saves game state to localStorage', async () => {
      const state = createMockGameState();
      await manager.saveGameState(state);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('notifies subscribers when state is saved', async () => {
      const subscriber = jest.fn();
      manager.subscribe(subscriber);

      const state = createMockGameState();
      await manager.saveGameState(state);

      expect(subscriber).toHaveBeenCalled();
      expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
        version: expect.any(Number),
        lastSaved: expect.any(Number)
      }));
    });

    it('handles storage quota errors', async () => {
      // Mock storage quota exceeded
      mockStorageEstimate.mockResolvedValue({ quota: 1000, usage: 999 });
      
      const state = createMockGameState();
      await expect(manager.saveGameState(state)).rejects.toThrow('Storage quota exceeded');
    });

    it('handles quota exceeded errors and tries to clear old data', async () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';
      mockLocalStorage.setItem.mockImplementation(() => { throw quotaError; });

      const oldData = {
        version: 1,
        data: {
          lastSaved: Date.now() - 1000000,
          version: 1
        }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));

      await expect(manager.saveGameState(createMockGameState())).rejects.toThrow();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('loadGameState', () => {
    it('loads game state from localStorage', () => {
      const mockState = createMockGameState();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        version: 1,
        data: mockState
      }));

      const loadedState = manager.loadGameState();
      expect(loadedState).toEqual(mockState);
    });

    it('returns null when no state exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(manager.loadGameState()).toBeNull();
    });

    it('handles corrupted data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      expect(manager.loadGameState()).toBeNull();
    });
  });

  describe('data migration', () => {
    it('migrates old data formats', () => {
      const oldState = {
        version: 0,
        data: {
          settings: {},
          gameData: {}
        }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldState));
      
      const loadedState = manager.loadGameState();
      expect(loadedState?.version).toBe(1);
      expect(loadedState?.settings?.autoSave).toBe(true);
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

  describe('data import/export', () => {
    it('exports current state', () => {
      const mockState = createMockGameState();
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        version: 1,
        data: mockState
      }));

      const exported = manager.exportData();
      expect(JSON.parse(exported)).toEqual(mockState);
    });

    it('handles empty export', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(manager.exportData()).toBe('');
    });

    it('imports valid data', async () => {
      const mockState = createMockGameState();
      const success = await manager.importData(JSON.stringify(mockState));
      expect(success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('rejects invalid import data', async () => {
      const success = await manager.importData('invalid json');
      expect(success).toBe(false);
    });
  });

  describe('game state clearing', () => {
    it('clears game state', () => {
      manager.clearGameState();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    it('notifies subscribers when state is cleared', () => {
      const subscriber = jest.fn();
      manager.subscribe(subscriber);
      
      manager.clearGameState();
      expect(subscriber).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});