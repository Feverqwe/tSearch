import {types, resolveIdentifier, getParentOfType} from 'mobx-state-tree';
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} ProfileItemTrackerStore
 * @property {string} id
 * @property {boolean} [selected]
 * @property {function} setSelected
 * @property {*} tracker
 */
const ProfileItemTrackerStore = types.model('ProfileItemTrackerStore', {
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
 * @property {ProfileItemTrackerStore[]} trackers
 * @property {function} setSelectedAll
 */
const ProfileStore = types.model('ProfileStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(ProfileItemTrackerStore)
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
    }
  };
});

export default ProfileStore;
export {ProfileItemTrackerStore};