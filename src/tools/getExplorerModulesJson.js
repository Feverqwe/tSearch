let cache = null;

const getExplorerModulesJson = async () => {
  if (cache) {
    return cache;
  } else {
    return cache = require('../../src/explorers.json'); // fetch('./explorers.json').then(r => r.json());
  }
};

export default getExplorerModulesJson;