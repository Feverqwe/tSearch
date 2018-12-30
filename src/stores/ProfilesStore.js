import {applyPatch, flow, isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import ProfileStore from "./ProfileStore";
import getLogger from "../tools/getLogger";
import storageGet from "../tools/storageGet";
import storageSet from "../tools/storageSet";
import reOrderStoreItems from "../tools/reOrderStoreItems";
import {compare} from "fast-json-patch";

const uuid = require('uuid/v4');

const logger = getLogger('ProfilesStore');


/**
 * @typedef {{}} ProfilesStore
 * @property {string} [state]
 * @property {ProfileStore[]} profiles
 * @property {string|undefined|null} profileId
 * @property {string[]} selectedTrackerIds
 * @property {function} setProfiles
 * @property {function} setProfileId
 * @property {function:Promise} fetchProfiles
 * @property {function} addSelectedTracker
 * @property {function} clearSelectedTrackers
 * @property {*} profile
 * @property {function} getProfileById
 * @property {function} isSelectedTracker
 * @property {*} selectedTrackers
 * @property {function} saveProfile
 * @property {function} saveProfiles
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const ProfilesStore = types.model('ProfilesStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  profiles: types.array(ProfileStore),
  profileId: types.maybeNull(types.string),
  selectedTrackerIds: types.array(types.string),
}).actions(/**ProfilesStore*/self => {
  return {
    setProfiles(profiles) {
      if (!profiles.length) {
        profiles.push(getDefaultProfile());
      }
      self.profiles = profiles;
    },
    setProfileId(id) {
      self.profileId = id;
      self.clearSelectedTrackers();
    },
    fetchProfiles: flow(function* () {
      self.state = 'pending';
      try {
        const [syncStorage, storage] = yield Promise.all([
          storageGet({profiles: []}, 'sync'),
          storageGet({profileId: null}),
        ]);
        if (isAlive(self)) {
          try {
            self.setProfiles(syncStorage.profiles);
          } catch (err) {
            logger.error('fetchProfiles error, profiles will cleared', err);
            self.setProfiles([]);
          }
          try {
            self.setProfileId(storage.profileId);
          } catch (err) {
            logger.error('fetchProfiles error, active profile will cleared', err);
            self.setProfileId(null);
          }
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchProfiles error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    addSelectedTracker(id) {
      self.selectedTrackerIds.push(id);
    },
    clearSelectedTrackers() {
      self.selectedTrackerIds = [];
    },
    patchProfiles(patch) {
      applyPatch(self.profiles, patch);
    },
  };
}).views(/**ProfilesStore*/self => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'sync') {
      const change = changes.profiles;
      if (change) {
        const newValue = change.newValue || [];
        const oldValue = reOrderStoreItems(self.profiles, newValue, 'id');
        self.setProfiles(oldValue);
        const diff = compare(oldValue, newValue).filter((patch) => {
          if (patch.op === 'remove') {
            if (/^\/\d+\/trackers\/\d+\/meta\/(name|author|homepageURL|trackerURL|downloadURL)$/.test(patch.path)) {
              return false;
            }
          }
          return true;
        });
        self.patchProfiles(diff);
      }
    }
  };

  return {
    get profile() {
      let profile = null;
      if (self.profileId) {
        profile = resolveIdentifier(ProfileStore, self, self.profileId);
      }
      if (!profile) {
        profile = self.profiles[0];
      }
      return profile;
    },
    getProfileById(id) {
      return resolveIdentifier(ProfileStore, self, id);
    },
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
    get prepSelectedTrackerIds() {
      if (!self.selectedTrackerIds.length) {
        return self.profile.trackers.map(tracker => tracker.id);
      } else {
        return self.selectedTrackerIds;
      }
    },
    saveProfile() {
      return storageSet({profileId: self.profileId});
    },
    saveProfiles() {
      return storageSet({profiles: self.profiles.toJSON()}, 'sync');
    },
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

const getDefaultProfile = () => {
  return {
    id: uuid(),
    name: 'Default',
    trackers: [{
      id: 'rutracker'
    }, {
      id: 'nnmclub'
    }, {
      id: 'kinozal'
    }, {
      id: 'rutor'
    }, {
      id: 'tfile'
    }, {
      id: 'opentorrent'
    }]
  };
};

export default ProfilesStore;