import {flow, isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import ProfilesItemStore from "./ProfilesItemStore";
import getTrackersJson from "../tools/getTrackersJson";

const logger = getLogger('ProfileEditorStore');


/**
 * @typedef {ProfilesItemStore} EditProfileItemStore
 * @property {string} id
 * @property {string|undefined|null} name
 * @property {function} setName
 */
const EditProfileItemStore = types.compose('EditProfileItemStore', ProfilesItemStore, types.model({
  id: types.string,
  name: types.maybeNull(types.string),
})).actions(self => {
  return {
    setName(name) {
      self.name = name;
    }
  };
}).views(self => {
  return {
    getTrackersByFilter(type) {
      return [];
    }
  };
});


/**
 * @typedef {ProfilesItemStore} EditProfilesItemStore
 */
const EditProfilesItemStore = types.compose('EditProfilesItemStore', ProfilesItemStore);


/**
 * @typedef {{}} ProfileEditorStore
 * @property {string} [saveState]
 * @property {EditProfilesItemStore[]} profiles
 * @property {EditProfileItemStore|undefined|null} profile
 * @property {function:Promise} save
 * @property {function} moveProfile
 * @property {function} setProfileById
 * @property {function} getProfileById
 */
const ProfileEditorStore = types.model('ProfileEditorStore', {
  saveState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  profiles: types.array(EditProfilesItemStore),
  profile: types.maybeNull(EditProfileItemStore),
  trackerIdsState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  trackerIds: types.maybeNull(types.array(types.string)),
}).actions(self => {
  return {
    save: flow(function* () {
      self.state = 'pending';
      try {
        yield new Promise(resolve => chrome.storage.sync.set({profiles: self.profiles}, resolve));
        if (isAlive(self)) {
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchHistory error', err);
        if (isAlive(self)) {
          self.state = 'error';
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
    setProfileById(id) {
      let profile = self.getProfileById(id);
      if (!profile) {
        profile = {id};
      }
      self.profile = JSON.parse(JSON.stringify(profile));
    },
    fetchTrackerIds: flow(function* () {
      self.trackerIdsState = 'pending';
      try {
        const trackerIds = yield Promise.all([
          new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => Object.keys(storage.trackers)),
          getTrackersJson().then(trackers => Object.keys(trackers))
        ]).then(results => {
          const trackerIds = [].concat(...results);
          return trackerIds.filter((id, index) => {
            return trackerIds.indexOf(id) === index;
          });
        });
        if (isAlive(self)) {
          self.trackerIds = trackerIds;
          self.trackerIdsState = 'done';
        }
      } catch (err) {
        logger.error('fetchHistory error', err);
        if (isAlive(self)) {
          self.trackerIdsState = 'error';
        }
      }
    }),
  };
}).views(self => {
  return {
    getProfileById(id) {
      return resolveIdentifier(EditProfilesItemStore, self, id);
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
export {EditProfileItemStore};