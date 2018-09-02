import {flow, getParentOfType, isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import ProfilesItemStore from "./ProfilesItemStore";
import getTrackersJson from "../tools/getTrackersJson";

const logger = getLogger('ProfileEditorStore');

/**
 * @typedef {ProfilesItemStore} EditProfileItemStore
 * @property {string|undefined|null} name
 * @property {function} setName
 * @property {function} getTrackersByFilter
 * @property {*} allTrackers
 */
const EditProfileItemStore = types.compose('EditProfileItemStore', ProfilesItemStore, types.model({
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
      switch (type) {
        case 'selected': {
          return self.trackers;
        }
        case 'withoutList': {
          return self.allTrackers.filter(tracker => {
            return self.trackers.indexOf(tracker) === -1;
          });
        }
        default: {
          return self.allTrackers;
        }
      }
    },
    get allTrackers() {
      const result = [];
      const ids = [];
      self.trackers.forEach(tracker => {
        ids.push(tracker.id);
        result.push(tracker);
      });
      const profileEditorStore = getParentOfType(self, ProfileEditorStore);
      profileEditorStore.trackerIds.forEach(id => {
        if (ids.indexOf(id) === -1) {
          result.push({id});
        }
      });
      return result;
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
 * @property {Map<*,EditProfileItemStore>} profilePages
 * @property {string} [trackerIdsState]
 * @property {string[]|undefined|null} trackerIds
 * @property {function:Promise} save
 * @property {function} moveProfile
 * @property {function} getProfile
 * @property {function} removeProfile
 * @property {function:Promise} fetchTrackerIds
 * @property {function} getProfileById
 */
const ProfileEditorStore = types.model('ProfileEditorStore', {
  saveState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  profiles: types.array(EditProfilesItemStore),
  profilePages: types.map(EditProfileItemStore),
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
    getProfile(id) {
      if (!self.profilePages.has(id)) {
        const profile = self.getProfileById(id) || {id};
        self.profilePages.set(id, JSON.parse(JSON.stringify(profile)));
      }
      return self.profilePages.get(id);
    },
    removeProfile(id) {
      self.profilePages.delete(id);
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