/**
 * @jest-environment jsdom
 */
import { StorageManager } from '../storage';

// Mock localStorage
const mockStorage: { [key: string]: string } = {};
const mockLocalStorage = {
  getItem: jest.fn((key: string) => mockStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }),
  key: jest.fn((index: number) => Object.keys(mockStorage)[index]),
  get length() {
    return Object.keys(mockStorage).length;
  }
};

// Mock Date.now
const mockNow = 1700000000000;  // Fixed timestamp for tests
jest.spyOn(Date, 'now').mockImplementation(() => mockNow);

// Mock Storage API
const mockStorageEstimate = jest.fn().mockResolvedValue({ quota: 1000, usage: 500 });
Object.defineProperty(navigator, 'storage', {
  value: {
    estimate: mockStorageEstimate
  },
  configurable: true,
  writable: true
});

// Mock localStorage in window
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Helper function to create a mock game state
const createMockGameState = () => ({
  version: 1,
  lastSaved: mockNow,
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
    // Clear all mocks and storage
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
    // Reset storage estimate mock
    mockStorageEstimate.mockReset();
    mockStorageEstimate.mockResolvedValue({ quota: 1000, usage: 500 });
    
    manager = StorageManager.getInstance();
  });

  describe('singleton pattern', () => {
    it('returns the same instance', () => {
      const instance1 = StorageManager.getInstance();
      const instance2 = StorageManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('storage operations', () => {
    it('saves and loads game state correctly', async () => {
      const state = createMockGameState();
      await manager.saveGameState(state);

      const savedData = JSON.parse(mockStorage['catan-companion-state']);
      expect(savedData.data).toEqual(state);

      const loadedState = manager.loadGameState();
      expect(loadedState).toEqual(state);
    });

    it('handles storage quota errors', async () => {
      mockStorageEstimate.mockResolvedValueOnce({ quota: 1000, usage: 999 });
      const state = createMockGameState();

      await expect(manager.saveGameState(state)).rejects.toThrow('Storage quota exceeded');
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('handles quota exceeded errors and clears old data', async () => {
      // Set up old data
      const oldState = createMockGameState();
      await manager.saveGameState(oldState);

      // Mock quota exceeded on next save
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const newState = createMockGameState();
      await expect(manager.saveGameState(newState)).rejects.toThrow();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('subscription system', () => {
    it('notifies subscribers of state changes', async () => {
      const subscriber = jest.fn();
      manager.subscribe(subscriber);

      const state = createMockGameState();
      await manager.saveGameState(state);

      expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({
        version: 1,
        settings: expect.any(Object)
      }));
    });

    it('allows unsubscribing', async () => {
      const subscriber = jest.fn();
      const unsubscribe = manager.subscribe(subscriber);

      unsubscribe();

      const state = createMockGameState();
      await manager.saveGameState(state);

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe('data migration', () => {
    it('migrates old data formats', () => {
      const oldState = {
        version: 0,
        data: {
          settings: {}
        }
      };

      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(oldState));
      
      const loadedState = manager.loadGameState();
      expect(loadedState?.version).toBe(1);
      expect(loadedState?.settings?.autoSave).toBe(true);
    });

    it('handles invalid stored data', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid json');
      expect(manager.loadGameState()).toBeNull();
    });
  });

  describe('data import/export', () => {
    it('exports current state', async () => {
      const state = createMockGameState();
      await manager.saveGameState(state);

      const exported = manager.exportData();
      expect(JSON.parse(exported)).toEqual(state);
    });

    it('returns empty string when no state exists', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      expect(manager.exportData()).toBe('');
    });

    it('successfully imports valid data', async () => {
      const state = createMockGameState();
      const success = await manager.importData(JSON.stringify(state));
      expect(success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('rejects invalid import data', async () => {
      const success = await manager.importData('invalid json');
      expect(success).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles localStorage errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const state = createMockGameState();
      await expect(manager.saveGameState(state)).rejects.toThrow();
    });

    it('handles storage estimate API errors', async () => {
      mockStorageEstimate.mockRejectedValueOnce(new Error('Estimate failed'));
      
      const state = createMockGameState();
      await manager.saveGameState(state);  // Should still save without quota check
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });
});