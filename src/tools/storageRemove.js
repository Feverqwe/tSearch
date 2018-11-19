const storageRemove = (keys, area = 'local') => {
  return new Promise(resolve => chrome.storage[area].remove(keys, resolve));
};

export default storageRemove;