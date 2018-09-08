import {flow, isAlive, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import ProfileStore from "./ProfileStore";
import EditProfileStore from "./EditProfileStore";

const logger = getLogger('ProfileEditorStore');

/**
 * @typedef {ProfileStore} ProfileEditorProfileStore
 */
const ProfileEditorProfileStore = types.compose('ProfileEditorProfileStore', ProfileStore);

/**
 * @typedef {{}} ProfileEditorStore
 * @property {string} [saveState]
 * @property {ProfileEditorProfileStore[]} profiles
 * @property {Map<*,EditProfileStore>} profilePages
 * @property {function:Promise} save
 * @property {function} moveProfile
 * @property {function} getProfilePage
 * @property {function} removeProfilePage
 * @property {function} saveProfilePage
 * @property {function} removeProfileById
 * @property {function} getProfileById
 */
const ProfileEditorStore = types.model('ProfileEditorStore', {
  saveState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  profiles: types.array(ProfileEditorProfileStore),
  profilePages: types.map(EditProfileStore),
}).actions(self => {
  return {
    save: flow(function* () {
      self.saveState = 'pending';
      try {
        const profiles = JSON.parse(JSON.stringify(self.profiles));
        yield new Promise(resolve => chrome.storage.sync.set({profiles}, resolve));
        if (isAlive(self)) {
          self.saveState = 'done';
        }
      } catch (err) {
        logger.error('save error', err);
        if (isAlive(self)) {
          self.saveState = 'error';
        }
      }
    }),
    moveProfile(id, prevId, nextId) {
      const items = self.profiles.slice(0);
      const index = getIndexById(items, id);
      const prevIndex = prevId && getIndexById(items, prevId);
      const nextIndex = nextId && getIndexById(items, nextId);
      const item = items[index];
      const prevItem = items[prevIndex];
      const nextItem = items[nextIndex];

      items.splice(index, 1);

      if (prevItem) {
        const pos = items.indexOf(prevItem);
        if (pos !== -1) {
          items.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = items.indexOf(nextItem);
        if (pos !== -1) {
          items.splice(pos, 0, item);
        }
      } else {
        items.push(item);
      }

      self.profiles = items;
    },
    getProfilePage(id) {
      if (!self.profilePages.has(id)) {
        const profile = self.getProfileById(id) || {id};
        const snapshot = JSON.parse(JSON.stringify(profile));
        snapshot.selectedTrackerIds = snapshot.trackers && snapshot.trackers.map(tracker => tracker.id) || [];
        self.profilePages.set(id, snapshot);
      }
      return self.profilePages.get(id);
    },
    removeProfilePage(id) {
      self.profilePages.delete(id);
    },
    saveProfilePage(id) {
      const profile = JSON.parse(JSON.stringify(self.profilePages.get(id)));
      const prevProfile = self.getProfileById(id);
      if (prevProfile) {
        const profiles = self.profiles.slice(0);
        const pos = profiles.indexOf(prevProfile);
        if (pos !== -1) {
          profiles.splice(pos, 1, profile);
          self.profiles = profiles;
        }
      } else {
        self.profiles.push(profile);
      }
    },
    removeProfileById(id) {
      const profiles = self.profiles.slice(0);
      const profile = self.getProfileById(id);
      const pos = profiles.indexOf(profile);
      if (pos !== -1) {
        profiles.splice(pos, 1);
        self.profiles = profiles;
      }
    }
  };
}).views(self => {
  return {
    getProfileById(id) {
      let result = null;
      self.profiles.forEach(profile => {
        if (profile.id === id) {
          return result = profile;
        }
      });
      return result;
    }
  };
});

const getIndexById = (items, id) => {
  let result = null;
  items.some((item, index) => {
    if (item.id === id) {
      result = index;
      return true;
    }
  });
  return result;
};

export default ProfileEditorStore;