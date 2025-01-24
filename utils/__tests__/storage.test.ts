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
      },
      writable: true
    });

    // Mock Object.keys to return actual keys
    Object.defineProperty(localStorage, 'length', { value: 0 });
    Object.defineProperty(localStorage, 'key', { value: (i: number) => Object.keys(mockLocalStorage)[i] });
  });

  it('handles errors in clearOldData reduce operation', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Add some test data
    mockLocalStorage['test1'] = 'invalid json'; // Will cause JSON.parse error
    mockLocalStorage['test2'] = JSON.stringify({
      data: { lastSaved: Date.now() }
    });
    
    // Force quota exceeded error to trigger clearOldData
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    
    jest.spyOn(localStorage, 'setItem')
      .mockImplementationOnce(() => { throw quotaError; })
      .mockImplementation(() => undefined);

    // This should trigger clearOldData's error handling
    await storage.saveGameState({
      version: 1,
      lastSaved: Date.now(),
      settings: {}
    }).catch(() => {});

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to save game state:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('handles empty localStorage during clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Force quota exceeded error to trigger clearOldData with empty storage
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    
    jest.spyOn(localStorage, 'setItem')
      .mockImplementationOnce(() => { throw quotaError; })
      .mockImplementation(() => undefined);

    await storage.saveGameState({
      version: 1,
      lastSaved: Date.now(),
      settings: {}
    }).catch(() => {});

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('handles getItem errors in clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockLocalStorage['test1'] = '{"data": {"lastSaved": 123}}';
    
    // Force getItem to throw error
    jest.spyOn(localStorage, 'getItem')
      .mockImplementationOnce(() => { throw new Error('getItem failed'); });

    // Force quota exceeded error to trigger clearOldData
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    
    jest.spyOn(localStorage, 'setItem')
      .mockImplementationOnce(() => { throw quotaError; })
      .mockImplementation(() => undefined);

    await storage.saveGameState({
      version: 1,
      lastSaved: Date.now(),
      settings: {}
    }).catch(() => {});

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});