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

  it('handles errors in clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Create a subclass just for testing protected method
    class TestableStorage extends StorageManager {
      public callClearOldData() {
        this._clearOldData();
      }
    }
    
    // Mock Object.keys to throw
    jest.spyOn(Object, 'keys').mockImplementation(() => {
      throw new Error('Object.keys failed');
    });

    // Use the test subclass
    const testableStorage = (storage as any).constructor.instance = new TestableStorage();
    testableStorage.callClearOldData();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to clear old data:',
      expect.any(Error)
    );
    
    errorSpy.mockRestore();
  });
});