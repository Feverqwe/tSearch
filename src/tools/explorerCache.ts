import getNow from './getNow';
import storageGet from './storageGet';
import storageSet from './storageSet';

type CacheItem = {value: PackagedExplorerItem[]; createdAt: number; source?: string};

export async function readExplorerCache() {
  const {explorerCache} = await storageGet({explorerCache: {} as Record<string, CacheItem>});
  return explorerCache ?? {};
}

export function findExplorerCacheEntry(
  cache: Awaited<ReturnType<typeof readExplorerCache>>,
  key: string,
) {
  return Object.hasOwn(cache, key) && Array.isArray(cache[key]?.value) ? cache[key] : undefined;
}

export async function getExplorerCache(key: string, ttl: number, source?: string) {
  const item = findExplorerCacheEntry(await readExplorerCache(), key);
  if (item && (!ttl || (item.source === source && item.createdAt > getNow() - ttl))) {
    return item.value;
  }
}

export function setExplorerCache(key: string, value: PackagedExplorerItem[], source?: string) {
  return navigator.locks.request('tsearch:explorer-cache', async () => {
    const cache = await readExplorerCache();
    await storageSet({explorerCache: {...cache, [key]: {value, createdAt: getNow(), source}}});
  });
}
