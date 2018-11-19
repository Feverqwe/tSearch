const storageSet = (data, area = 'local') => {
  return new Promise(resolve => chrome.storage[area].set(data, resolve));
};

export default storageSet;