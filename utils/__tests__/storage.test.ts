import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    // Create a minimal mock of localStorage
    const mockStorage = Object.create(null);
    mockStorage.getItem = null;
    mockStorage.setItem = null;
    mockStorage.removeItem = null;

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });

    storage = StorageManager.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('catches error in clearOldData', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Force QuotaExceededError to trigger clearOldData
    const quotaError = new Error('Storage quota exceeded');
    quotaError.name = 'QuotaExceededError';

    // Mock Object.keys to return empty array to avoid undefined issues
    jest.spyOn(Object, 'keys').mockReturnValueOnce([]);

    // Try to save which will fail and trigger clearOldData
    try {
      await storage.saveGameState({
        version: 1,
        lastSaved: Date.now(),
        settings: {}
      });
    } catch (e) {
      // Expected to throw since localStorage methods are null
    }

    // Verify error was logged from clearOldData
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to clear old data:',
      expect.any(TypeError)
    );

    errorSpy.mockRestore();
  });
});