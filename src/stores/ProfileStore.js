import {resolveIdentifier, types} from 'mobx-state-tree';
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} ProfileTrackerStore
 * @property {string} id
 * @property {*} tracker
 */
const ProfileTrackerStore = types.model('ProfileTrackerStore', {
  id: types.string,
  meta: types.optional(types.model({
    name: types.maybe(types.string),
    downloadURL: types.maybe(types.string),
    homepageURL: types.maybe(types.string),
    author: types.maybe(types.string),
  }), {}),
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
 * @property {*} trackersIsReady
 */
const ProfileStore = types.model('ProfileStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(ProfileTrackerStore)
}).views(self => {
  return {
    get trackersIsReady() {
      return self.trackers.every(trackerProfile => {
        const tracker = trackerProfile.tracker;
        if (!tracker) {
          return true;
        } else {
          return !['idle', 'pending'].includes(trackerProfile.tracker.state);
        }
      });
    },
  };
});

export default ProfileStore;
export {ProfileTrackerStore};