export type StorageSubscriber = () => void;

interface StorageData {
  version: number;
  data: any;
}

export class StorageManager {
  private static instance: StorageManager;
  private subscribers: Set<StorageSubscriber> = new Set();
  private static readonly CURRENT_VERSION = 1;
  private static readonly STORAGE_KEY = 'game_state';

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  subscribe(subscriber: StorageSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => subscriber());
  }

  loadGameState(): any | null {
    try {
      const stored = localStorage.getItem(StorageManager.STORAGE_KEY);
      if (!stored) return null;

      const data: StorageData = JSON.parse(stored);
      return this.migrateData(data);
    } catch {
      return null;
    }
  }

  async saveGameState(state: any): Promise<void> {
    try {
      // Check storage quota
      const { quota, usage } = await navigator.storage.estimate();
      if (quota && usage && (quota - usage) < 1000000) {
        throw new Error('Storage quota exceeded');
      }

      const data: StorageData = {
        version: StorageManager.CURRENT_VERSION,
        data: state
      };

      try {
        localStorage.setItem(StorageManager.STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        if (this.isQuotaError(error)) {
          // Try to clear some space
          await this.clearOldData();
          // Retry save
          localStorage.setItem(StorageManager.STORAGE_KEY, JSON.stringify(data));
        } else {
          throw error;
        }
      }

      this.notifySubscribers();
    } catch (error) {
      if (this.isQuotaError(error)) {
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }

  private isQuotaError(error: any): boolean {
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.message.includes('quota')
    );
  }

  private migrateData(data: StorageData): any {
    let migrated = data.data;

    // Migrate from version 0 to 1 (add autoSave setting)
    if (data.version === 0) {
      migrated = {
        ...migrated,
        settings: {
          ...migrated.settings,
          autoSave: true
        }
      };
    }

    return migrated;
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const imported = JSON.parse(jsonString);
      if (!this.validateImportedData(imported)) {
        return false;
      }

      await this.saveGameState(imported);
      return true;
    } catch {
      return false;
    }
  }

  private validateImportedData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'version' in data &&
      'lastSaved' in data &&
      'settings' in data &&
      typeof data.settings === 'object'
    );
  }

  private async clearOldData(): Promise<void> {
    const state = this.loadGameState();
    if (!state || !state.lastSaved) return;

    // Keep only recent data
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (state.lastSaved < oneWeekAgo) {
      localStorage.removeItem(StorageManager.STORAGE_KEY);
    }
  }
}