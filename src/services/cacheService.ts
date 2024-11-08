interface CacheOptions {
  expiryMinutes?: number;
}

class CacheService {
  private storage: Map<string, { data: any; expiry: number }> = new Map();

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const expiry = options.expiryMinutes 
      ? Date.now() + (options.expiryMinutes * 60 * 1000)
      : Date.now() + (30 * 60 * 1000); // Default 30 minutes

    this.storage.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.storage.delete(key);
      return null;
    }

    return item.data as T;
  }

  remove(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

export const cache = new CacheService(); 