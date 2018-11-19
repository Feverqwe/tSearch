const storageGet = (data, area = 'local') => {
  return new Promise(resolve => chrome.storage[area].get(data, resolve));
};

export default storageGet;