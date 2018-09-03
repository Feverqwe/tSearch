import {resolveIdentifier, types} from 'mobx-state-tree';
import ProfilesItemStore from "./ProfilesItemStore";


/**
 * @typedef {{}} ProfileStore
 * @property {string} id
 * @property {string[]} selectedTrackerIds
 * @property {function} addSelectedTracker
 * @property {function} clearSelectedTrackers
 * @property {function} isSelectedTracker
 * @property {*} selectedTrackers
 * @property {*} trackersIsReady
 * @property {*} profile
 */
const ProfileStore = types.model('ProfileStore', {
  id: types.string,
  selectedTrackerIds: types.array(types.string),
}).actions(self => {
  return {
    addSelectedTracker(id) {
      self.selectedTrackerIds.push(id);
    },
    clearSelectedTrackers() {
      self.selectedTrackerIds = [];
    },
  };
}).views(self => {
  return {
    isSelectedTracker(id) {
      return self.selectedTrackerIds.indexOf(id) !== -1;
    },
    get selectedTrackers() {
      let result = self.profile.trackers.filter(tracker => {
        return self.selectedTrackerIds.indexOf(tracker.id) !== -1;
      });
      if (!result.length) {
        result = self.profile.trackers;
      }
      return result;
    },
    get trackersIsReady() {
      return self.profile.trackers.every(trackerProfile => {
        const tracker = trackerProfile.tracker;
        if (!tracker) {
          return true;
        } else {
          return !['idle', 'pending'].includes(trackerProfile.tracker.state);
        }
      });
    },
    get profile() {
      return resolveIdentifier(ProfilesItemStore, self, self.id);
    }
  };
});

export default ProfileStore;