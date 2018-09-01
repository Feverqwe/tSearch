import getTrackersJson from "./getTrackersJson";
import getLogger from "./getLogger";
import loadLocalTrackerModule from "./loadLocalTrackerModule";

const compareVersions = require('compare-versions');
const {ErrorWithCode} = require('./errors');
const promiseLimit = require('promise-limit');

const logger = getLogger('getTrackerModule');
const oneLimit = promiseLimit(1);


const getTrackerModule = id => {
  return Promise.all([
    getTrackersJson().then(trackers => trackers[id]),
    new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => storage.trackers[id])
  ]).then(([localTrackerVersion, tracker]) => {
    if (localTrackerVersion && tracker) {
      let localIsHigher = true;
      try {
        localIsHigher = compareVersions(localTrackerVersion, tracker.meta.version) > 0;
      } catch (err) {
        logger.error('compareVersions error', id, err);
      }
      if (localIsHigher) {
        tracker = null;
      }
    }

    if (!tracker) {
      return loadLocalTrackerModule(id).catch(err => {
        logger.error('loadLocalTrackerModule error', id, err);
        return null;
      }).then(localTracker => {
        return oneLimit(() => {
          return new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => {
            storage.trackers[id] = localTracker;
            return new Promise(resolve => chrome.storage.local.set(storage, resolve)).then(() => localTracker);
          });
        });
      });
    } else {
      return tracker;
    }
  }).then(localTracker => {
    if (!localTracker) {
      throw new ErrorWithCode(`Tracker is not found ${id}`, 'TRACKER_IS_NOT_FOUND');
    }
    return localTracker;
  });
};

export default getTrackerModule;