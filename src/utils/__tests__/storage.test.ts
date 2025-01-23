import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storageManager: StorageManager;
  let mockLocalStorage: { [key: string]: string };
  let mockNavigatorStorage: { estimate: jest.Mock };
  let subscribers: (() => void)[];

  beforeEach(() => {
    mockLocalStorage = {};
    mockNavigatorStorage = { estimate: jest.fn() };
    subscribers = [];

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

    Object.defineProperty(window.navigator, 'storage', {
      value: mockNavigatorStorage,
      writable: true
    });

    storageManager = StorageManager.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
    subscribers.forEach(sub => storageManager.unsubscribe(sub));
  });

  it('manages subscribers correctly', () => {
    const subscriber = jest.fn();
    storageManager.subscribe(subscriber);
    
    // Save should notify subscribers
    storageManager.saveGameState({ test: 'data' });
    expect(subscriber).toHaveBeenCalled();

    // Unsubscribe should work
    storageManager.unsubscribe(subscriber);
    subscriber.mockClear();
    storageManager.saveGameState({ test: 'data2' });
    expect(subscriber).not.toHaveBeenCalled();
  });

  it('handles storage quota checks correctly', async () => {
    // Test when storage is nearly full
    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 1000000,
      usage: 999900
    });

    await expect(storageManager.saveGameState({ test: 'data' }))
      .rejects
      .toThrow('Storage quota exceeded');

    // Test when there's plenty of space
    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 10000000,
      usage: 1000
    });

    await expect(storageManager.saveGameState({ test: 'data' }))
      .resolves
      .not.toThrow();
  });

  it('handles localStorage quota errors', async () => {
    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 10000000,
      usage: 1000
    });

    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';

    (window.localStorage.setItem as jest.Mock)
      .mockImplementationOnce(() => { throw quotaError; })
      .mockImplementationOnce(() => {}); // Allow retry after clearOldData

    await expect(storageManager.saveGameState({ test: 'data' }))
      .resolves
      .not.toThrow();

    expect(window.localStorage.removeItem).toHaveBeenCalled();
  });

  it('loads and migrates data correctly', () => {
    // Test loading non-existent data
    expect(storageManager.loadGameState()).toBeNull();

    // Test loading invalid JSON
    mockLocalStorage['gameState'] = 'invalid json';
    expect(storageManager.loadGameState()).toBeNull();

    // Test loading v0 data
    const v0Data = {
      version: 0,
      data: { settings: {} }
    };
    mockLocalStorage['gameState'] = JSON.stringify(v0Data);
    const migratedData = storageManager.loadGameState();
    expect(migratedData.settings.autoSave).toBe(true);

    // Test loading current version
    const currentData = {
      version: 1,
      data: { test: 'data' }
    };
    mockLocalStorage['gameState'] = JSON.stringify(currentData);
    expect(storageManager.loadGameState().test).toBe('data');
  });

  it('validates imported data correctly', async () => {
    // Test invalid JSON
    expect(await storageManager.importData('invalid json')).toBe(false);

    // Test missing required fields
    expect(await storageManager.importData(JSON.stringify({}))).toBe(false);

    // Test valid data
    const validData = {
      version: 1,
      lastSaved: new Date().toISOString(),
      settings: { autoSave: true }
    };
    expect(await storageManager.importData(JSON.stringify(validData))).toBe(true);
  });

  it('handles errors during data clearing', async () => {
    const error = new Error('Failed to clear');
    (window.localStorage.removeItem as jest.Mock).mockImplementation(() => {
      throw error;
    });

    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 10000000,
      usage: 1000
    });

    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';

    (window.localStorage.setItem as jest.Mock)
      .mockImplementationOnce(() => { throw quotaError; });

    await expect(storageManager.saveGameState({ test: 'data' }))
      .rejects
      .toThrow('Storage quota exceeded');
  });
});