import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    // Mock localStorage
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: Object.freeze(mockStorage),
      writable: true
    });

    Object.defineProperty(window.localStorage, 'getItem', {
      value: jest.fn().mockImplementation(() => { 
        throw new Error('getItem failed');
      })
    });

    storage = StorageManager.getInstance();
  });

  it('catches error in clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Force QuotaExceededError to trigger clearOldData
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    
    // Mock setItem to throw quota error
    Object.defineProperty(window.localStorage, 'setItem', {
      value: jest.fn().mockImplementation(() => {
        throw quotaError;
      })
    });

    // Try to save which should trigger clearOldData
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
    
    errorSpy.mockRestore();
  });
});