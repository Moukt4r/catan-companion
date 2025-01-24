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
        })
      },
      writable: true
    });

    storage = StorageManager.getInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles Object.keys error in clearOldData', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Make Object.keys throw
    const originalKeys = Object.keys;
    Object.keys = jest.fn().mockImplementation((obj) => {
      if (obj === localStorage) {
        throw new Error('Object.keys failed');
      }
      return originalKeys(obj);
    });

    // Trigger clearOldData via QuotaExceededError
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    jest.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw quotaError;
    });

    // Attempt save which should trigger clearOldData
    try {
      await storage.saveGameState({
        version: 1,
        lastSaved: Date.now(),
        settings: {}
      });
    } catch (e) {
      // Expected to throw
    }

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to clear old data:',
      expect.any(Error)
    );

    // Cleanup
    Object.keys = originalKeys;
    consoleErrorSpy.mockRestore();
  });
});