import {flow, isAlive, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import ProfilesItemStore from "./ProfilesItemStore";
import getTrackersJson from "../tools/getTrackersJson";
import getTrackerModule from "../tools/getTrackerModule";

const logger = getLogger('ProfileEditorStore');

/**
 * @typedef {{}} EditorTrackerStore
 * @property {string} id
 * @property {string} [state]
 * @property {*} [meta]
 * @property {function} getIconUrl
 */
const EditorProfileTrackerStore = types.model('EditorTrackerStore', {
  id: types.identifier,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  meta: types.optional(types.frozen(), {}),
}).views(self => {
  return {
    getIconUrl() {
      if (self.meta.icon64) {
        return self.meta.icon64;
      } else if (self.meta.icon) {
        return self.meta.icon;
      }
      return '';
    },
  };
});

/**
 * @typedef {ProfilesItemStore} EditProfileItemStore
 * @property {string|undefined|null} name
 * @property {string} [trackerModulesState]
 * @property {EditorProfileTrackerStore[]} trackerModules
 * @property {function} setName
 * @property {function:Promise} fetchTrackerModules
 * @property {function} getTrackersByFilter
 * @property {*} selectedTackers
 * @property {*} withoutListTackers
 * @property {*} trackerIds
 */
const EditProfileItemStore = types.compose('EditProfileItemStore', ProfilesItemStore, types.model({
  name: types.maybeNull(types.string),
  trackerModulesState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  trackerModules: types.array(EditorProfileTrackerStore),
  selectedTrackerIds: types.array(types.string),
})).actions(self => {
  return {
    setName(name) {
      self.name = name;
    },
    fetchTrackerModules: flow(function* () {
      self.trackerModulesState = 'pending';
      try {
        const trackerIds = yield Promise.all([
          new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => Object.keys(storage.trackers)),
          getTrackersJson().then(trackers => Object.keys(trackers)),
        ]).then(results => {
          const trackerIds = [].concat(...results);
          return trackerIds.filter((id, index) => {
            return trackerIds.indexOf(id) === index;
          });
        });
        const trackerModules = yield Promise.all(trackerIds.map(id => {
          return getTrackerModule(id).catch(err => {
            logger.error('getTrackerModule error', id, err);
            return {id};
          });
        }));
        self.trackers.forEach(profilesItemTracker => {
          if (trackerIds.indexOf(profilesItemTracker.id) === -1) {
            trackerModules.push(profilesItemTracker);
          }
        });
        if (isAlive(self)) {
          self.trackerModules = trackerModules;
          self.trackerModulesState = 'done';
        }
      } catch (err) {
        logger.error('fetchHistory error', err);
        if (isAlive(self)) {
          self.trackerModulesState = 'error';
        }
      }
    }),
  };
}).views(self => {
  return {
    getTrackersByFilter(type) {
      switch (type) {
        case 'selected': {
          return self.selectedTackers;
        }
        case 'withoutList': {
          return self.withoutListTackers;
        }
        default: {
          return self.selectedTackers.concat(self.withoutListTackers);
        }
      }
    },
    get selectedTackers() {
      return self.trackerModules.filter(tracker => {
        return self.selectedTrackerIds.indexOf(tracker.id) !== -1;
      });
    },
    get withoutListTackers() {
      return self.trackerModules.filter(tracker => {
        return self.selectedTrackerIds.indexOf(tracker.id) === -1;
      });
    },
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
 * @property {function:Promise} save
 * @property {function} moveProfile
 * @property {function} getProfile
 * @property {function} removeProfile
 * @property {function} getProfileById
 */
const ProfileEditorStore = types.model('ProfileEditorStore', {
  saveState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  profiles: types.array(EditProfilesItemStore),
  profilePages: types.map(EditProfileItemStore),
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
        const snapshot = JSON.parse(JSON.stringify(profile));
        snapshot.selectedTrackerIds = snapshot.trackers && snapshot.trackers.map(tracker => tracker.id) || [];
        self.profilePages.set(id, snapshot);
      }
      return self.profilePages.get(id);
    },
    removeProfile(id) {
      self.profilePages.delete(id);
    },
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
export {EditProfileItemStore};