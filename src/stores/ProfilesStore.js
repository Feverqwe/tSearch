import {flow, getSnapshot, isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import ProfileStore from "./ProfileStore";
import getLogger from "../tools/getLogger";
import _isEqual from "lodash.isequal";
import storageGet from "../tools/storageGet";
import storageSet from "../tools/storageSet";

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
        profiles.push(getTestProfile());
      }
      self.profiles = profiles;
    },
    setProfileId(id) {
      self.profileId = id;
    },
    fetchProfiles: flow(function* () {
      self.state = 'pending';
      try {
        const [syncStorage, storage] = yield Promise.all([
          storageGet({profiles: []}, 'sync'),
          storageGet({profileId: null}),
        ]);
        if (isAlive(self)) {
          self.setProfiles(syncStorage.profiles);
          self.setProfileId(storage.profileId);
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
  };
}).views(/**ProfilesStore*/self => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'sync') {
      const change = changes.profiles;
      if (change) {
        const profiles = change.newValue || [];
        if (!_isEqual(profiles, getSnapshot(self.profiles))) {
          self.setProfiles(profiles);
        }
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
    }]
  };
};

const getTestProfile = () => {
  return {
    id: 'test',
    name: 'Test',
    trackers: [{
      id: 'rutracker'
    }, {
      id: 'nnmclub1'
    }]
  };
};

export default ProfilesStore;