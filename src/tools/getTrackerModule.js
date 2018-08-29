import getTrackersJson from "./getTrackersJson";
import getLogger from "./getLogger";
import loadLocalTrackerModule from "./loadLocalTrackerModule";

const compareVersions = require('compare-versions');
const {ErrorWithCode} = require('./errors');

const logger = getLogger('getTrackerModule');


const getTrackerModule = id => {
  return Promise.all([
    getTrackersJson().then(trackers => trackers[id]),
    new Promise(resolve => chrome.storage.local.get({[id]: null}, resolve)).then(storage => storage[id])
  ]).then(([localVersion, module]) => {
    if (localVersion && module) {
      let localIsHigher = true;
      try {
        localIsHigher = compareVersions(localVersion, module.meta.version) > 0;
      } catch (err) {
        logger.error('compareVersions error', id, err);
      }
      if (localIsHigher) {
        module = null;
      }
    }

    if (!module) {
      return loadLocalTrackerModule(id).catch(err => {
        logger.error('loadLocalTrackerModule error', id, err);
        return null;
      }).then(module => {
        return new Promise(resolve => chrome.storage.local.set({[id]: module}, resolve)).then(() => module);
      });
    } else {
      return module;
    }
  }).then(module => {
    if (!module) {
      throw new ErrorWithCode(`Tracker is not found ${id}`, 'TRACKER_IS_NOT_FOUND');
    }
    return module;
  });
};

export default getTrackerModule;