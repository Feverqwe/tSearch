const cache = new Map();

/**
 * @param {string} path
 * @return {function}
 */
const resolvePath = path => {
  const parts = path.split('.');
  const endPoint = parts.pop();
  let scope = window;
  while (parts.length) {
    scope = scope[parts.shift()];
  }
  return {scope, endPoint};
};

/**
 * @param {string} path
 * @return {Promise<any>}
 */
const promisifyApi = path => {
  if (!cache.has(path)) {
    const {scope, endPoint: fn} = resolvePath(path);
    cache.set(path, (...args) => new Promise((resolve, reject) => scope[fn].call(scope, ...args, (...args) => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve(...args);
    })));
  }
  return cache.get(path);
};

export default promisifyApi;