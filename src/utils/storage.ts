export type StorageSubscriber = () => void;

interface StorageData {
  version: number;
  data: any;
}

export class StorageManager {
  private static instance: StorageManager;
  private subscribers: Set<StorageSubscriber> = new Set();
  private static readonly CURRENT_VERSION = 1;
  private static readonly STORAGE_KEY = 'gameState';

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

  unsubscribe(subscriber: StorageSubscriber): void {
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
      return {
        ...this.migrateData(data),
        version: StorageManager.CURRENT_VERSION
      };
    } catch {
      return null;
    }
  }

  async saveGameState(state: any): Promise<void> {
    // Check storage quota first
    const { quota, usage } = await navigator.storage.estimate();
    if (quota && usage && (quota - usage) < 1000000) {
      throw new Error('Storage quota exceeded');
    }

    // Prepare data
    const data: StorageData = {
      version: StorageManager.CURRENT_VERSION,
      data: state
    };

    const serializedData = JSON.stringify(data);

    try {
      localStorage.setItem(StorageManager.STORAGE_KEY, serializedData);
      this.notifySubscribers();
    } catch (error) {
      if (this.isQuotaError(error)) {
        // Try to clear space and retry
        await this.clearOldData();
        try {
          localStorage.setItem(StorageManager.STORAGE_KEY, serializedData);
          this.notifySubscribers();
          return;
        } catch (retryError) {
          if (this.isQuotaError(retryError)) {
            throw new Error('Storage quota exceeded');
          }
          throw retryError;
        }
      }
      throw error; // Rethrow non-quota errors directly
    }
  }

  private isQuotaError(error: any): boolean {
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.message?.toLowerCase().includes('quota')
    );
  }

  private migrateData(data: StorageData): any {
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
    localStorage.removeItem(StorageManager.STORAGE_KEY);
  }
}