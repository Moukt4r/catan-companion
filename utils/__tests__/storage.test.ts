import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;
  let originalKeys: any;

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });

    // Store original Object.keys
    originalKeys = Object.keys;

    storage = StorageManager.getInstance();
  });

  afterEach(() => {
    // Restore Object.keys
    Object.keys = originalKeys;
    jest.restoreAllMocks();
  });

  it('handles errors in clearOldData when Object.keys throws', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Set Object.keys to undefined to force error
    (Object as any).keys = undefined;
    
    // Create a subclass just for testing protected method
    class TestableStorage extends StorageManager {
      public callClearOldData() {
        this._clearOldData();
      }
    }

    // Use the test subclass
    const testableStorage = (storage as any).constructor.instance = new TestableStorage();
    testableStorage.callClearOldData();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to clear old data:',
      expect.any(TypeError)
    );
    
    errorSpy.mockRestore();
  });
});