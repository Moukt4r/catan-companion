// Keeping only the changed method for brevity
  _clearOldData(): void {
    try {
      const keys = Object.keys(localStorage);
      const oldestKey = keys.reduce((oldest, key) => {
        const item = localStorage.getItem(key);
        if (!item) return oldest;
        
        try {
          const { data } = JSON.parse(item);
          return !oldest || data.lastSaved < oldest.lastSaved ? { key, lastSaved: data.lastSaved } : oldest;
        } catch {
          return oldest;
        }
      }, null as { key: string; lastSaved: number } | null);

      if (oldestKey) {
        localStorage.removeItem(oldestKey.key);
      }
    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  }