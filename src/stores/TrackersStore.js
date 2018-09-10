import {flow, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import TrackerStore from "./TrackerStore";
import getLogger from "../tools/getLogger";
import getTrackers from "../tools/getTrackers";
import _isEqual from "lodash.isequal";
import getUnic from "../tools/getUnic";

const logger = getLogger('TrackersStore');

/**
 * @typedef {{}} TrackersStore
 * @property {string} [state]
 * @property {Map<*,TrackerStore>|undefined} trackers
 * @property {function} setTrackers
 * @property {function:Promise} fetchTrackers
 * @property {function} deleteTracker
 * @property {function} setTracker
 * @property {function} getTackerById
 * @property {function} saveTrackers
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const TrackersStore = types.model('TrackersStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  trackers: types.maybe(types.map(TrackerStore)),
}).actions(self => {
  return {
    setTrackers(trackers) {
      self.trackers = trackers;
    },
    fetchTrackers: flow(function* () {
      self.state = 'pending';
      try {
        const trackers = yield getTrackers();
        if (isAlive(self)) {
          self.setTrackers(trackers);
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchTrackers error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    deleteTracker(id) {
      self.trackers.delete(id);
    },
    setTracker(id, tracker) {
      self.trackers.set(id, tracker);
    }
  };
}).views(self => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'local') {
      const change = changes.trackers;
      if (change) {
        const {newValue = {}} = change;
        const ids = getUnic([...Object.keys(newValue), ...self.trackers.keys()]);
        ids.forEach(id => {
          const tracker = self.trackers.get(id);
          const newTracker = newValue[id];
          if (tracker && !newTracker) {
            self.deleteTracker(id);
          } else
          if (!tracker && newTracker) {
            self.setTracker(id, newTracker);
          } else
          if (tracker.code !== newTracker.code) {
            self.setTracker(id, newTracker);
            tracker.reloadWorker();
          } else
          if (!_isEqual(tracker.options.toJSON(), newTracker.options)) {
            tracker.setOptions(newTracker.options);
          }
        });
      }
    }
  };

  return {
    getTackerById(id) {
      return resolveIdentifier(TrackerStore, self, id);
    },
    saveTrackers() {
      return new Promise(resolve => chrome.storage.local.set({trackers: self.trackers.toJSON()}, resolve));
    },
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

export default TrackersStore;