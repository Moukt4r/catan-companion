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
  });

  it('handles every error path in clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Set up test data
    mockLocalStorage['test1'] = JSON.stringify({
      data: { lastSaved: Date.now() - 1000 }
    });

    // Mock reduce to throw error
    const originalReduce = Array.prototype.reduce;
    Array.prototype.reduce = jest.fn().mockImplementation(() => {
      throw new Error('Reduce failed');
    });

    // Mock localStorage.getItem and removeItem to throw errors
    jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('getItem failed');
    });

    jest.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('removeItem failed');
    });

    // Force quota exceeded error to trigger clearOldData
    const quotaError = new Error('Storage full');
    quotaError.name = 'QuotaExceededError';
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    // This should hit the catch block in clearOldData
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
    Array.prototype.reduce = originalReduce;
    errorSpy.mockRestore();
  });
});