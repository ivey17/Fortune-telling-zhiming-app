/**
 * Base API client
 */

const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes cache

export const clearApiCache = () => {
  Object.keys(cache).forEach(key => delete cache[key]);
  console.log(`[Cache Cleared] Manual clear`);
};

export const fetchWithAuth = async (url: string, options: RequestInit & { skipCache?: boolean } = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Only cache GET requests that don't skip cache
  const isCacheable = (!options.method || options.method === 'GET') && !options.skipCache;
  if (isCacheable && cache[url] && (Date.now() - cache[url].timestamp < CACHE_DURATION)) {
    console.log(`[Cache Hit] ${url}`);
    return cache[url].data;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Request failed');
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  
  if (isCacheable) {
    cache[url] = { data, timestamp: Date.now() };
  } else if (options.method && options.method !== 'GET') {
    // Clear all cache on any mutation to ensure consistency
    clearApiCache();
  }
  
  return data;
};
