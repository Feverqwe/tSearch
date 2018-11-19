import getNow from "./getNow";

const promiseLimit = require('promise-limit');

const limitOne = promiseLimit(1);

class ExplorerCache {
  cache = null;
  setCache(cache) {
    this.updateCacheTtl();
    this.cache = cache;
  }
  getCache() {
    this.updateCacheTtl();
    return this.cache;
  }
  hasCache() {
    return !!this.cache;
  }
  cacheTimeout = null;
  updateCacheTtl() {
    clearTimeout(this.cacheTimeout);
    this.cacheTimeout = setTimeout(() => {
      this.cache = null;
    }, 5000);
  }
  getStorage() {
    return limitOne(() => {
      if (this.hasCache()) {
        return this.getCache();
      }

      return new Promise(resolve => chrome.storage.local.get({
        explorerCache: {}
      }, resolve)).then(result => {
        this.setCache(result);
        return result;
      });
    });
  }
  setStorage(storage) {
    this.setCache(storage);
    return limitOne(() => {
      return new Promise(resolve => chrome.storage.local.set(storage, resolve));
    });
  }
  set(key, value) {
    return this.getStorage().then(storage => {
      storage.explorerCache[key] = {
        value,
        createdAt: getNow(),
      };
      return this.setStorage(storage);
    });
  }
  get(key, ttl) {
    return this.getStorage().then(storage => {
      const item = storage.explorerCache[key];
      if (item && (!ttl || item.createdAt > getNow() - ttl)) {
        return item.value;
      }
    });
  }
}

export default ExplorerCache;