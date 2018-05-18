let cache = null;

const getTrackersJson = async () => {
  if (cache) {
    return cache;
  } else {
    return cache = require('../../trackers.json'); // fetch('./trackers.json').then(r => r.json());
  }
};

export default getTrackersJson;