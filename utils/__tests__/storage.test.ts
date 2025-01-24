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
      value: mockStorage,
      writable: true
    });

    storage = StorageManager.getInstance();
  });

  it('handles error while clearing old data', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Set up mock data
    const mockData = {
      data: {
        lastSaved: Date.now() - 1000
      }
    };

    // Mock localStorage operations
    jest.spyOn(localStorage, 'getItem')
        .mockReturnValueOnce(JSON.stringify(mockData)); // For initial valid data

    jest.spyOn(Object, 'keys').mockImplementation(() => {
      return ['test-key'];
    });

    // Force QuotaExceededError to trigger clearOldData
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';

    // Force error by making localStorage immutable during clearOldData
    Object.defineProperty(window, 'localStorage', {
      value: Object.freeze({
        getItem: jest.fn().mockImplementation(() => { throw new Error('getItem failed'); }),
        setItem: jest.fn().mockImplementation(() => { throw quotaError; }),
        removeItem: jest.fn().mockImplementation(() => { throw new Error('removeItem failed'); })
      }),
      writable: false,
      configurable: false
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