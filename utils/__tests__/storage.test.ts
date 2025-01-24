import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });

    storage = StorageManager.getInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('catches error in clearOldData', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Force Object.keys to throw
    jest.spyOn(Object, 'keys').mockImplementation(() => {
      throw new Error('Object.keys failed');
    });

    // Call _clearOldData directly
    (storage as any)._clearOldData();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to clear old data:',
      expect.any(Error)
    );
    
    errorSpy.mockRestore();
  });
});