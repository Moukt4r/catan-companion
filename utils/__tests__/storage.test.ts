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
        })
      },
      writable: true
    });
    storage = StorageManager.getInstance();
  });

  it('catches errors in clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Force error in Object.keys to trigger catch block
    const originalKeys = Object.keys;
    Object.keys = jest.fn().mockImplementation(() => {
      throw new Error('Failed to access localStorage');
    });

    // Trigger clearOldData via quota exceeded error
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    try {
      await storage.saveGameState({
        version: 1,
        lastSaved: Date.now(),
        settings: {}
      });
    } catch {}

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to clear old data:',
      expect.any(Error)
    );

    // Cleanup
    Object.keys = originalKeys;
    errorSpy.mockRestore();
  });
});