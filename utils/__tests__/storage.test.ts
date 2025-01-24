import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key]),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true
    });

    storage = StorageManager.getInstance();
  });

  it('handles malformed data in clearOldData', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Add malformed data to localStorage
    mockLocalStorage['test1'] = 'not json';
    mockLocalStorage['test2'] = '{"data": {"lastSaved": 123}}';
    mockLocalStorage['test3'] = '{"invalid": "json"}';

    storage.clearGameState();
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it('handles quota error during save', async () => {
    const mockError = new Error('Quota exceeded');
    mockError.name = 'QuotaExceededError';

    jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw mockError;
    });

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    await expect(storage.saveGameState(state)).rejects.toThrow('Quota exceeded');
  });

  it('handles migration errors', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockLocalStorage['catan-companion-state'] = JSON.stringify({
      version: 0,
      data: {
        version: 0,
        lastSaved: Date.now(),
        settings: {}
      }
    });
    
    jest.spyOn(storage, 'saveGameState').mockRejectedValue(new Error('Migration save failed'));
    
    const state = storage.loadGameState();
    expect(state).toBeTruthy();
    
    consoleErrorSpy.mockRestore();
  });

  it('handles localStorage errors in clearGameState', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    storage.clearGameState();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});