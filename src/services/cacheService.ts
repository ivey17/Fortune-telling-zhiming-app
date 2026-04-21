
/**
 * Simple cache service using localStorage with TTL
 */

interface CacheItem<T> {
  value: T;
  expiry: number; // timestamp
}

export const cacheService = {
  /**
   * Set a cache item
   * @param key Cache key
   * @param value Value to store
   * @param ttl Time to live in seconds
   */
  set: <T>(key: string, value: T, ttl: number): void => {
    const now = new Date();
    const item: CacheItem<T> = {
      value,
      expiry: now.getTime() + ttl * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  /**
   * Get a cache item
   * @param key Cache key
   * @returns The value or null if expired/not found
   */
  get: <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: CacheItem<T> = JSON.parse(itemStr);
      const now = new Date();

      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (e) {
      return null;
    }
  },

  /**
   * Remove a cache item
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * Clear all cache for this app (keys starting with a prefix)
   */
  clearAll: (prefix: string = 'fortune_'): void => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
};

/**
 * Get remaining seconds until the end of today
 */
export const getSecondsUntilEndOfDay = (): number => {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
};

/**
 * Get remaining seconds until the end of the year
 */
export const getSecondsUntilEndOfYear = (): number => {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  return Math.floor((endOfYear.getTime() - now.getTime()) / 1000);
};
