import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;
  let originalReduce: any;

  beforeEach(() => {
    // Store original reduce method
    originalReduce = Array.prototype.reduce;

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

  afterEach(() => {
    // Restore original reduce method
    Array.prototype.reduce = originalReduce;
    jest.clearAllMocks();
  });

  it('catches errors during clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock reduce to throw an error
    Array.prototype.reduce = jest.fn().mockImplementation(() => {
      throw new Error('Reduce error');
    });

    // Mock Object.keys to return some test keys
    jest.spyOn(Object, 'keys').mockReturnValueOnce(['test-key']);

    // Force a quota error to trigger clearOldData
    const quotaError = new Error('Storage quota exceeded');
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

    errorSpy.mockRestore();
  });
});