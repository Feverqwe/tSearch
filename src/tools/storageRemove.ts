const storageRemove = (keys: string | string[], area: 'local' | 'sync' = 'local') => {
  return chrome.storage[area].remove(keys);
};

export default storageRemove;
