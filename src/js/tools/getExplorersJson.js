let cache = null;

const getExplorersJson = async () => {
  if (cache) {
    return cache;
  } else {
    return cache = require('../../explorers.json'); // fetch('./explorers.json').then(r => r.json());
  }
};

export default getExplorersJson;