import promisifyApi from "./promisifyApi";

const promiseLimit = require('promise-limit');

const limitOne = promiseLimit(1);

/**
 * @typedef {{}} CacheObject
 * @property {number} [insertTime]
 * @property {any} data
 */

class Cache {
  constructor(id) {
    this._id = id;
    this._storageType = 'local';
    this._cache = null;
  }

  /**
   * @return {string}
   * @private
   */
  getKey() {
    return `cache_${this._id}`;
  }

  setStorageType(type) {
    this._storageType = type;
  }

  /**
   * @param {any} defaultValue
   * @return {Promise<CacheObject>}
   * @private
   */
  loadCache(defaultValue) {
    return promisifyApi(`chrome.storage.${this._storageType}.get`)({
      [this.getKey()]: {
        data: defaultValue,
        insertTime: 0
      }
    }).then(storage => this._cache = storage[this.getKey()]);
  }

  /**
   * @return {boolean}
   */
  isLoaded() {
    return !!this._cache;
  }

  /**
   * @param {CacheObject} cacheData
   * @return {boolean}
   */
  isExpire(cacheData) {
    return cacheData.insertTime + 24 * 60 * 60 * 60 < Date.now() / 1000;
  }

  /**
   * @param {any} defaultValue
   * @return {Promise<CacheObject>}
   */
  async getData(defaultValue) {
    if (!this._cache) {
      this._cache = await this.loadCache(defaultValue);
    }
    return this._cache;
  }

  /**
   * @param {any} data
   * @return {Promise<CacheObject>}
   */
  setData(data) {
    this._cache = {
      data: data,
      insertTime: Math.trunc(Date.now() / 1000),
    };

    return limitOne(() => {
      return promisifyApi(`chrome.storage.${this._storageType}.set`)({
        [this.getKey()]: this._cache
      });
    }).then(() => this._cache);
  }
}

export default Cache;