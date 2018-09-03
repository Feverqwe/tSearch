import {flow, getParentOfType, getSnapshot, isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import ProfilesItemStore from "./ProfilesItemStore";
import getLogger from "../tools/getLogger";
import _isEqual from "lodash.isequal";
import RootStore from "./RootStore";

const uuid = require('uuid/v4');

const logger = getLogger('ProfilesStore');


/**
 * @typedef {{}} ProfilesStore
 * @property {string} [state]
 * @property {ProfilesItemStore[]} profiles
 * @property {string|undefined|null} profileId
 * @property {function} setProfiles
 * @property {function} setProfileId
 * @property {function:Promise} fetchProfiles
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const ProfilesStore = types.model('ProfilesStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  profiles: types.array(ProfilesItemStore),
  profileId: types.maybeNull(types.string),
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
          new Promise(resolve => chrome.storage.sync.get({profiles: []}, resolve)),
          new Promise(resolve => chrome.storage.local.get({profileId: null}, resolve)),
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
          self.syncActiveProfile();
        }
      }
    }
  };

  return {
    syncActiveProfile() {
      const rootStore = getParentOfType(self, RootStore);
      const profile = resolveIdentifier(ProfilesItemStore, self, self.profileId);
      if (profile) {
        rootStore.setProfile(profile);
      }
    },
    saveProfile() {
      return new Promise(resolve => chrome.storage.local.set({profileId: self.profileId}, resolve));
    },
    saveProfiles() {
      return new Promise(resolve => chrome.storage.sync.set({profiles: self.profiles.toJSON()}, resolve));
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