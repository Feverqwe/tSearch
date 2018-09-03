import {flow, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import TrackerStore from "./TrackerStore";
import getLogger from "../tools/getLogger";
import getTrackers from "../tools/getTrackers";

const logger = getLogger('TrackersStore');

/**
 * @typedef {{}} TrackersStore
 * @property {string} [state]
 * @property {Map<*,TrackerStore>|undefined|null} trackers
 * @property {function} setTrackers
 * @property {function:Promise} fetchTrackers
 * @property {function} getTackerById
 */
const TrackersStore = types.model('TrackersStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  trackers: types.maybeNull(types.map(TrackerStore)),
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
  };
}).views(self => {
  return {
    getTackerById(id) {
      return resolveIdentifier(TrackerStore, self, id);
    }
  };
});

export default TrackersStore;