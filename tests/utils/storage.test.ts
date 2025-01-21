import { StorageManager } from '../../utils/storage';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockLocalStorage.store[key]),
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
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('StorageManager', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    storageManager = StorageManager.getInstance();
  });

  it('should save and load game state', async () => {
    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    await storageManager.saveGameState(state);
    const loaded = storageManager.loadGameState();

    expect(loaded).toEqual(state);
  });

  it('should handle quota exceeded errors by clearing old data', async () => {
    // First, fill storage with some old data
    const oldState = {
      key: 'old-data',
      lastSaved: Date.now() - 1000,
      settings: { autoSave: true }
    };

    mockLocalStorage.setItem('old-key', JSON.stringify({
      version: 1,
      data: oldState
    }));

    // Mock localStorage.setItem to throw QuotaExceededError first time
    let firstCall = true;
    mockLocalStorage.setItem.mockImplementation((key, value) => {
      if (firstCall) {
        firstCall = false;
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }
      mockLocalStorage.store[key] = value;
    });

    const newState = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    // This should trigger clearOldData and then retry
    await storageManager.saveGameState(newState);

    // Verify the old data was removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('old-key');

    // Verify the new state was saved
    const loaded = storageManager.loadGameState();
    expect(loaded).toEqual(newState);
  });

  it('should notify subscribers when state changes', async () => {
    const mockCallback = jest.fn();
    const unsubscribe = storageManager.subscribe(mockCallback);

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    await storageManager.saveGameState(state);
    expect(mockCallback).toHaveBeenCalledWith(state);

    // Test unsubscribe
    unsubscribe();
    await storageManager.saveGameState({ ...state, lastSaved: Date.now() });
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should validate imported data', async () => {
    const validState = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    const invalidState = {
      foo: 'bar'
    };

    // Valid import
    const validResult = await storageManager.importData(JSON.stringify(validState));
    expect(validResult).toBe(true);

    // Invalid import
    const invalidResult = await storageManager.importData(JSON.stringify(invalidState));
    expect(invalidResult).toBe(false);
  });

  it('should handle storage quota check', async () => {
    // Mock storage estimate API
    const mockEstimate = jest.fn();
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: mockEstimate
      },
      configurable: true
    });

    // Test when quota is available
    mockEstimate.mockResolvedValueOnce({ quota: 1000, usage: 500 });
    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };
    await storageManager.saveGameState(state);
    expect(mockLocalStorage.setItem).toHaveBeenCalled();

    // Test when quota is exceeded
    mockEstimate.mockResolvedValueOnce({ quota: 1000, usage: 1000 });
    await expect(storageManager.saveGameState(state)).rejects.toThrow('Storage quota exceeded');
  });

  it('should handle failed storage estimates gracefully', async () => {
    // Mock storage estimate API to throw
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: jest.fn().mockRejectedValue(new Error('Estimate failed'))
      },
      configurable: true
    });

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    // Should still attempt to save even if estimate fails
    await storageManager.saveGameState(state);
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('should clear game state', () => {
    storageManager.clearGameState();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('catan-companion-state');
  });

  it('should export data correctly', async () => {
    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    await storageManager.saveGameState(state);
    const exported = storageManager.exportData();
    expect(JSON.parse(exported)).toEqual(state);
  });
});