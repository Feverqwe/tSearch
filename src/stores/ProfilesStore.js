import {flow, getSnapshot, isAlive, types} from 'mobx-state-tree';
import ProfilesItemStore from "./ProfilesItemStore";
import getLogger from "../tools/getLogger";
import _isEqual from "lodash.isequal";

const logger = getLogger('ProfilesStore');


/**
 * @typedef {{}} ProfilesStore
 * @property {string} [state]
 * @property {ProfilesItemStore[]} profiles
 * @property {function} setProfiles
 * @property {function:Promise} fetchProfiles
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const ProfilesStore = types.model('ProfilesStore', {
  state: types.optional(types.enumeration('State', ['idle', 'pending', 'done', 'error']), 'idle'),
  profiles: types.array(ProfilesItemStore)
}).actions(/**ProfilesStore*/self => {
  return {
    setProfiles(profiles) {
      self.profiles = profiles;
    },
    fetchProfiles: flow(function* () {
      self.state = 'pending';
      try {
        const storage = yield new Promise(resolve => chrome.storage.local.get({profiles: []}, resolve));
        if (isAlive(self)) {
          self.profiles = storage.profiles;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchHistory error', err);
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
        const profiles = change.newValue;
        if (!_isEqual(profiles, getSnapshot(self.profiles))) {
          self.setProfiles(profiles);
        }
      }
    }
  };

  return {
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

export default ProfilesStore;