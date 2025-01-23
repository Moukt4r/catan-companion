export type StorageSubscriber = () => void;

interface StorageData {
  version: number;
  data: any;
}

export class StorageManager {
  private static instance: StorageManager;
  private subscribers: Set<StorageSubscriber> = new Set();
  private static readonly CURRENT_VERSION = 1;
  private static readonly STORAGE_KEY = 'gameState';  // Fixed storage key

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  subscribe(subscriber: StorageSubscriber): void {
    this.subscribers.add(subscriber);
  }

  unsubscribe(subscriber: StorageSubscriber): void {  // Added explicit unsubscribe method
    this.subscribers.delete(subscriber);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => subscriber());
  }

  loadGameState(): any | null {
    try {
      const stored = localStorage.getItem(StorageManager.STORAGE_KEY);
      if (!stored) return null;

      const data: StorageData = JSON.parse(stored);
      return {  // Include version in returned data
        ...this.migrateData(data),
        version: StorageManager.CURRENT_VERSION
      };
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
          try {
            // Retry save
            localStorage.setItem(StorageManager.STORAGE_KEY, JSON.stringify(data));
          } catch (retryError) {
            if (this.isQuotaError(retryError)) {
              throw new Error('Storage quota exceeded');
            }
            throw retryError;
          }
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
    // Migrate from version 0 to 1 (add autoSave setting)
    if (!data.version || data.version === 0) {
      return {
        ...data.data,
        settings: {
          ...(data.data.settings || {}),
          autoSave: true
        }
      };
    }
    return data.data;
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
    // Always remove old data when clearing
    localStorage.removeItem(StorageManager.STORAGE_KEY);
  }
}