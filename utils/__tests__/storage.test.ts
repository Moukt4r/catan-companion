import { StorageManager } from '../storage';

describe('StorageManager', () => {
  let storage: StorageManager;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockLocalStorage = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => mockLocalStorage[key],
        setItem: (key: string, value: string) => {
          mockLocalStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockLocalStorage[key];
        },
        clear: () => {
          mockLocalStorage = {};
        }
      },
      writable: true
    });

    storage = StorageManager.getInstance();
  });

  it('handles error when clearing game state', () => {
    const mockError = new Error('Storage error');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw mockError;
    });

    storage.clearGameState();
    expect(console.error).toHaveBeenCalledWith('Failed to clear game state:', mockError);
  });

  it('handles storage migration and save', async () => {
    const oldState = {
      version: 0,
      data: {
        version: 0,
        lastSaved: Date.now() - 1000,
        settings: {}
      }
    };

    mockLocalStorage['catan-companion-state'] = JSON.stringify(oldState);
    
    // This will trigger migration and save
    const loadedState = storage.loadGameState();
    
    expect(loadedState).toBeTruthy();
    expect(loadedState?.version).toBe(1);
    expect(loadedState?.settings?.autoSave).toBe(true);
  });

  it('handles error during save after migration', async () => {
    const oldState = {
      version: 0,
      data: {
        version: 0,
        lastSaved: Date.now() - 1000,
        settings: {}
      }
    };

    mockLocalStorage['catan-companion-state'] = JSON.stringify(oldState);
    
    const mockError = new Error('Save error');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(storage, 'saveGameState').mockRejectedValue(mockError);
    
    const loadedState = storage.loadGameState();
    
    expect(loadedState).toBeTruthy();
    expect(loadedState?.version).toBe(1);
    await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async save
    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});