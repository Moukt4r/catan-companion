import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    // Mock the entire localStorage object
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });

    storage = StorageManager.getInstance();

    // Mock Object.keys to always throw when called with localStorage
    const originalKeys = Object.keys;
    Object.keys = jest.fn((obj) => {
      if (obj === localStorage) {
        throw new Error('Object.keys failed');
      }
      return originalKeys(obj);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('catches error in clearOldData', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Directly call clearOldData using type assertion
    type StorageManagerPrivate = {
      clearOldData: () => void;
    };
    const privateStorage = storage as unknown as StorageManagerPrivate;
    privateStorage.clearOldData();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to clear old data:',
      expect.any(Error)
    );
    
    errorSpy.mockRestore();
  });
});