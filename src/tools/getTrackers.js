import getTrackersJson from "./getTrackersJson";
import loadLocalTrackerModule from "./loadLocalTrackerModule";
import getLogger from "./getLogger";
import TrackerStore from "../stores/TrackerStore";
import {destroy} from "mobx-state-tree";
import storageGet from "./storageGet";
import storageSet from "./storageSet";

const compareVersions = require('compare-versions');

const logger = getLogger('getTrackers');

const getTrackers = () => {
  return Promise.all([
    getTrackersJson(),
    storageGet({trackers: {}}).then(storage => storage.trackers)
  ]).then(([idLocalVersion, idTracker]) => {
    let storageChanged = false;
    const ids = Object.keys(idLocalVersion).concat(Object.keys(idTracker));
    const idsUnic = ids.filter((id, index) => ids.indexOf(id) === index);
    return Promise.all(idsUnic.map(id => {
      let tracker = idTracker[id];

      const localVersion = idLocalVersion[id];
      if (localVersion && tracker) {
        let localIsHigher = true;
        try {
          localIsHigher = compareVersions(localVersion, tracker.meta.version) > 0;
        } catch (err) {
          logger.error('compareVersions error', id, err);
        }
        if (localIsHigher) {
          tracker = null;
          delete idTracker[id];
        }
      }

      if (!tracker) {
        return loadLocalTrackerModule(id).then(localTracker => {
          const trackerStore = TrackerStore.create(localTracker);
          const tracker = trackerStore.toJSON();
          destroy(trackerStore);

          storageChanged = true;
          return idTracker[id] = tracker;
        }, err => {
          logger.error('loadLocalTrackerModule error', id, err);
        });
      }
    })).then(() => {
      if (storageChanged) {
        return storageSet({trackers: idTracker}).then(() => idTracker);
      } else {
        return idTracker;
      }
    });
  });
};

export default getTrackers;