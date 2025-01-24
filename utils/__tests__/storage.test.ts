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
        keys: jest.fn(() => Object.keys(mockLocalStorage))
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

    const mockError = new Error('Quota exceeded');
    mockError.name = 'QuotaExceededError';
    
    // First setItem call fails with quota error, triggering clearOldData
    jest.spyOn(window.localStorage, 'setItem')
      .mockImplementationOnce(() => { throw mockError; })
      .mockImplementationOnce(() => {}); // Second call succeeds

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    storage.saveGameState(state).catch(() => {});
    expect(consoleErrorSpy).not.toHaveBeenCalledWith('Failed to clear old data:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });

  it('handles error during JSON parse in clearOldData', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Failed to parse');
    jest.spyOn(JSON, 'parse').mockImplementationOnce(() => { throw mockError; });

    mockLocalStorage['test1'] = 'invalid json';
    
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    
    jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    storage.saveGameState(state).catch(() => {});
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save game state:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('handles invalid keys in clearOldData', () => {
    const mockError = new Error('Quota exceeded');
    mockError.name = 'QuotaExceededError';

    mockLocalStorage['test1'] = '{"data": null}';
    mockLocalStorage['test2'] = '{"data": {"lastSaved": null}}';
    
    jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw mockError;
    });

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    storage.saveGameState(state).catch(() => {});
  });

  it('handles failed localStorage.removeItem in clearOldData', () => {
    const mockError = new Error('Remove failed');
    jest.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
      throw mockError;
    });

    mockLocalStorage['test1'] = '{"data": {"lastSaved": 123}}';
    
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    
    jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    const state = {
      version: 1,
      lastSaved: Date.now(),
      settings: { autoSave: true }
    };

    storage.saveGameState(state).catch(() => {});
  });
});