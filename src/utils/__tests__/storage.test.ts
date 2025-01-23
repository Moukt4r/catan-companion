import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storageManager: StorageManager;
  let mockLocalStorage: { [key: string]: string };
  let mockNavigatorStorage: {
    estimate: jest.Mock;
  };

  beforeEach(() => {
    mockLocalStorage = {};
    mockNavigatorStorage = {
      estimate: jest.fn()
    };

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key]),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        })
      },
      writable: true
    });

    Object.defineProperty(window.navigator, 'storage', {
      value: mockNavigatorStorage,
      writable: true
    });

    storageManager = StorageManager.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('handles storage quota exceeded error during save', async () => {
    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 1000000,
      usage: 999900
    });

    await expect(storageManager.saveGameState({ test: 'data' }))
      .rejects
      .toThrow('Storage quota exceeded');
  });

  it('handles other quota errors during save', async () => {
    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 10000000,
      usage: 0
    });

    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';

    (window.localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
      throw quotaError;
    });

    await expect(storageManager.saveGameState({ test: 'data' }))
      .rejects
      .toThrow('Storage quota exceeded');
  });

  it('handles invalid data during import', async () => {
    const invalidJson = 'invalid json';
    const result = await storageManager.importData(invalidJson);
    expect(result).toBe(false);
  });
});