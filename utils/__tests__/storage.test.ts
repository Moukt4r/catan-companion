import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    // Create a minimal mock of localStorage that throws on all operations
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockImplementation(() => {
          throw new Error('getItem failed');
        }),
        setItem: jest.fn().mockImplementation(() => {
          throw new Error('setItem failed');
        }),
        removeItem: jest.fn().mockImplementation(() => {
          throw new Error('removeItem failed');
        })
      },
      writable: true
    });

    // Mock Object.keys to throw
    jest.spyOn(Object, 'keys').mockImplementation(() => {
      throw new Error('Object.keys failed');
    });

    storage = StorageManager.getInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('catches error in clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Force a QuotaExceededError to trigger clearOldData
    const quotaError = new Error('Storage quota exceeded');
    quotaError.name = 'QuotaExceededError';
    
    jest.spyOn(localStorage, 'setItem')
      .mockImplementationOnce(() => { throw quotaError; });

    try {
      await storage.saveGameState({
        version: 1,
        lastSaved: Date.now(),
        settings: {}
      });
    } catch {}

    // This verifies we hit the catch block in clearOldData
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to clear old data:',
      expect.any(Error)
    );
    
    errorSpy.mockRestore();
  });
});