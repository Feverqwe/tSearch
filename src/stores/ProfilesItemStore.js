import {resolveIdentifier, types} from 'mobx-state-tree';
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} ProfilesTrackerStore
 * @property {string} id
 * @property {*} tracker
 */
const ProfilesTrackerStore = types.model('ProfilesTrackerStore', {
  id: types.string,
}).views(self => {
  return {
    get tracker() {
      return resolveIdentifier(TrackerStore, self, self.id);
    }
  };
});


/**
 * @typedef {{}} ProfilesItemStore
 * @property {string} id
 * @property {string} name
 * @property {ProfilesTrackerStore[]} trackers
 * @property {*} trackersIsReady
 */
const ProfilesItemStore = types.model('ProfilesItemStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(ProfilesTrackerStore)
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

export default ProfilesItemStore;
export {ProfilesTrackerStore};