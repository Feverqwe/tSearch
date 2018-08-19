import {types, resolveIdentifier} from 'mobx-state-tree';
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} ProfileItemTrackerStore
 * @property {string} id
 * @property {*} tracker
 */
const ProfileItemTrackerStore = types.model('ProfileItemTrackerStore', {
  id: types.identifier,
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
 */
const ProfileStore = types.model('ProfileStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(ProfileItemTrackerStore)
});

export default ProfileStore;
export {ProfileItemTrackerStore};