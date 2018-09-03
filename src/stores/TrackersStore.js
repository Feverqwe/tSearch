import {flow, isAlive, types} from "mobx-state-tree";
import TrackerStore from "./TrackerStore";
import getTrackersJson from "../tools/getTrackersJson";
import getTrackerModule from "../tools/getTrackerModule";
import getLogger from "../tools/getLogger";

const logger = getLogger('TrackersStore');

/**
 * @typedef {{}} TrackersStore
 * @property {string} [state]
 * @property {Map<*,TrackerStore>} trackers
 * @property {function} setTrackers
 * @property {function:Promise} fetchTrackers
 */
const TrackersStore = types.model('TrackersStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  trackers: types.map(TrackerStore),
}).actions(self => {
  return {
    setTrackers(trackers) {
      self.trackers = trackers;
    },
    fetchTrackers: flow(function* () {
      self.state = 'pending';
      try {
        const trackerIds = yield Promise.all([
          new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => Object.keys(storage.trackers)),
          getTrackersJson().then(trackers => Object.keys(trackers)),
        ]).then(results => {
          const trackerIds = [].concat(...results);
          return trackerIds.filter((id, index) => {
            return trackerIds.indexOf(id) === index;
          });
        });
        const trackerModules = yield Promise.all(trackerIds.map(id => {
          return getTrackerModule(id).catch(err => {
            logger.error('getTrackerModule error', id, err);
            return {id};
          });
        }));
        const trackersObj = trackerModules.reduce((obj, tracker) => {
          obj[tracker.id] = tracker;
          return obj;
        }, {});
        if (isAlive(self)) {
          self.setTrackers(trackersObj);
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchTrackers error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
  };
}).views(self => {
  return {};
});

export default TrackersStore;