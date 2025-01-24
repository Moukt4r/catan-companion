import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockLocalStorage = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => mockLocalStorage[key],
        setItem: (key: string, value: string) => {
          mockLocalStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockLocalStorage[key];
        },
        clear: () => {
          mockLocalStorage = {};
        }
      },
      writable: true
    });

    Object.defineProperty(window, 'navigator', {
      value: {
        storage: {
          estimate: jest.fn().mockResolvedValue({
            quota: 100000000,
            usage: 1000000
          })
        }
      },
      writable: true
    });

    storage = StorageManager.getInstance();
  });

  it('handles storage quota check failure gracefully', async () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        storage: {
          estimate: jest.fn().mockRejectedValue(new Error('Quota check failed'))
        }
      },
      writable: true
    });

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    await expect(storage.saveGameState(state)).resolves.not.toThrow();
  });

  it('handles storage quota exceeded scenario', async () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        storage: {
          estimate: jest.fn().mockResolvedValue({
            quota: 1000,
            usage: 999
          })
        }
      },
      writable: true
    });

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    await expect(storage.saveGameState(state)).rejects.toThrow('Storage quota exceeded');
  });

  it('clears old data when quota is exceeded during save', async () => {
    const oldState = {
      version: 1,
      data: {
        version: 1,
        lastSaved: Date.now() - 1000000,
        settings: { autoSave: true }
      }
    };

    // Set up multiple items in localStorage
    Object.keys(mockLocalStorage).forEach(key => {
      mockLocalStorage[key] = JSON.stringify(oldState);
    });

    const saveError = new Error('Quota exceeded');
    saveError.name = 'QuotaExceededError';

    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = jest.fn().mockImplementation(() => {
      throw saveError;
    });

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    try {
      await storage.saveGameState(state);
    } catch (error) {
      expect(error).toBe(saveError);
    }

    window.localStorage.setItem = originalSetItem;
  });

  it('handles malformed data during loading', () => {
    mockLocalStorage['catan-companion-state'] = 'invalid json';
    expect(storage.loadGameState()).toBeNull();
  });

  it('handles import validation failure', async () => {
    const invalidData = JSON.stringify({ invalid: 'state' });
    expect(await storage.importData(invalidData)).toBe(false);
  });

  it('handles subscribers notification', () => {
    const mockCallback = jest.fn();
    const unsubscribe = storage.subscribe(mockCallback);
    
    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };
    
    storage.saveGameState(state);
    expect(mockCallback).toHaveBeenCalled();
    
    unsubscribe();
    jest.clearAllMocks();
    storage.saveGameState(state);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});