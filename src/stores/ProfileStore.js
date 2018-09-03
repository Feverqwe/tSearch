import {resolveIdentifier, types} from 'mobx-state-tree';
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} ProfileTrackerStore
 * @property {string} id
 * @property {boolean} [selected]
 * @property {function} setSelected
 * @property {*} tracker
 */
const ProfileTrackerStore = types.model('ProfileTrackerStore', {
  id: types.identifier,
  selected: types.optional(types.boolean, false),
}).actions(self => {
  return {
    setSelected(value) {
      self.selected = value;
    }
  };
}).views(self => {
  return {
    get tracker() {
      return resolveIdentifier(TrackerStore, self, self.id);
    }
  };
});

/**
 * @typedef {{}} ProfileStore
 * @property {string} id
 * @property {string} name
 * @property {ProfileTrackerStore[]} trackers
 * @property {function} setSelectedAll
 * @property {*} selectedTrackers
 * @property {*} trackersIsReady
 */
const ProfileStore = types.model('ProfileStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(ProfileTrackerStore)
}).views(self => {
  return {
    setSelectedAll(value) {
      self.trackers.forEach(tracker => {
        tracker.setSelected(value);
      });
    },
    get selectedTrackers() {
      let result = self.trackers.filter(tracker => {
        return tracker.selected;
      });
      if (!result.length) {
        result = self.trackers;
      }
      return result;
    },
    get trackersIsReady() {
      return self.trackers.every(trackerProfile => {
        return !['idle', 'pending'].includes(trackerProfile.tracker.state);
      });
    }
  };
});

export default ProfileStore;
export {ProfileTrackerStore};