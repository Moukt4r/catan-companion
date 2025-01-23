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
      writable: true,
      configurable: true
    });

    Object.defineProperty(window.navigator, 'storage', {
      value: mockNavigatorStorage,
      writable: true,
      configurable: true
    });

    storageManager = StorageManager.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
    subscribers.forEach(sub => storageManager.unsubscribe(sub));
  });

  it('manages subscribers correctly', async () => {
    const subscriber = jest.fn();
    storageManager.subscribe(subscriber);

    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 10000000,
      usage: 1000
    });

    await storageManager.saveGameState({ test: 'data' });
    expect(subscriber).toHaveBeenCalled();

    storageManager.unsubscribe(subscriber);
    subscriber.mockClear();
    await storageManager.saveGameState({ test: 'data2' });
    expect(subscriber).not.toHaveBeenCalled();
  });

  it('handles storage quota checks correctly', async () => {
    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 1000000,
      usage: 999900
    });

    await expect(storageManager.saveGameState({ test: 'data' }))
      .rejects
      .toThrow('Storage quota exceeded');

    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 10000000,
      usage: 1000
    });

    await storageManager.saveGameState({ test: 'data' });
    expect(window.localStorage.setItem).toHaveBeenCalled();
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
      .mockImplementationOnce(() => {});

    await storageManager.saveGameState({ test: 'data' });
    expect(window.localStorage.removeItem).toHaveBeenCalled();
  });

  it('loads and migrates data correctly', () => {
    expect(storageManager.loadGameState()).toBeNull();

    mockLocalStorage['gameState'] = 'invalid json';
    expect(storageManager.loadGameState()).toBeNull();

    const v0Data = {
      version: 0,
      data: { settings: {} }
    };
    mockLocalStorage['gameState'] = JSON.stringify(v0Data);
    const migratedData = storageManager.loadGameState();
    expect(migratedData.settings.autoSave).toBe(true);

    const currentData = {
      version: 1,
      data: { test: 'data' }
    };
    mockLocalStorage['gameState'] = JSON.stringify(currentData);
    expect(storageManager.loadGameState().test).toBe('data');
  });

  it('validates imported data correctly', async () => {
    expect(await storageManager.importData('invalid json')).toBe(false);
    expect(await storageManager.importData(JSON.stringify({}))).toBe(false);

    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 10000000,
      usage: 1000
    });

    const validData = {
      version: 1,
      lastSaved: new Date().toISOString(),
      settings: { autoSave: true }
    };
    expect(await storageManager.importData(JSON.stringify(validData))).toBe(true);
  });

  it('handles failed clearing during quota error', async () => {
    mockNavigatorStorage.estimate.mockResolvedValue({
      quota: 10000000,
      usage: 1000
    });

    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';

    (window.localStorage.setItem as jest.Mock).mockImplementation(() => { 
      throw quotaError; 
    });

    try {
      await storageManager.saveGameState({ test: 'data' });
      fail('Expected error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Storage quota exceeded');
    }
  });
});