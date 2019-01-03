import {applyPatch, flow, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import TrackerStore from "./TrackerStore";
import getLogger from "../tools/getLogger";
import getTrackers from "../tools/getTrackers";
import storageSet from "../tools/storageSet";
import mobxCompare from "../tools/mobxCompare";

const promiseLimit = require('promise-limit');

const logger = getLogger('TrackersStore');
const oneLimit = promiseLimit(1);

/**
 * @typedef {{}} TrackersStore
 * @property {string} [state]
 * @property {Map<*,TrackerStore>|undefined} trackers
 * @property {function} setTrackers
 * @property {function:Promise} fetchTrackers
 * @property {function} deleteTracker
 * @property {function} setTracker
 * @property {function} patchTrackers
 * @property {function} getTackerById
 * @property {function} saveTrackers
 * @property {function} getTrackersSnapshot
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
    },
    patchTrackers(patch) {
      applyPatch(self.trackers, patch);
    }
  };
}).views(self => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'local') {
      const change = changes.trackers;
      if (change) {
        const newValue = change.newValue || {};
        const diff = mobxCompare(self.trackers, newValue);
        self.patchTrackers(diff);
      }
    }
  };

  return {
    getTackerById(id) {
      return resolveIdentifier(TrackerStore, self, id);
    },
    saveTrackers() {
      return oneLimit(() => {
        return storageSet({trackers: self.getTrackersSnapshot()});
      });
    },
    getTrackersSnapshot() {
      return self.trackers.toJSON();
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