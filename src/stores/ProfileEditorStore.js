import {flow, isAlive, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import ProfilesItemStore from "./ProfilesItemStore";
import getTrackers from "../tools/getTrackers";

const escapeStringRegexp = require('escape-string-regexp');

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
 * @property {string} [trackerModuleMapState]
 * @property {Map<*,EditorProfileTrackerStore>} trackerModuleMap
 * @property {string[]} selectedTrackerIds
 * @property {function} setName
 * @property {function:Promise} fetchTrackerModules
 * @property {function} addSelectedTrackerId
 * @property {function} removeSelectedTrackerId
 * @property {function} moveTracker
 * @property {function} getTrackersByFilter
 * @property {function} getTrackersWithFilter
 * @property {function} getTackerModuleById
 * @property {*} selectedTackers
 * @property {*} withoutListTackers
 */
const EditProfileItemStore = types.compose('EditProfileItemStore', ProfilesItemStore, types.model({
  name: types.maybeNull(types.string),
  trackerModuleMapState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  trackerModuleMap: types.map(EditorProfileTrackerStore),
  selectedTrackerIds: types.array(types.string),
})).actions(self => {
  return {
    setName(name) {
      self.name = name;
    },
    setTrackers() {
      self.trackers = JSON.parse(JSON.stringify(self.selectedTrackerIds.map(id => {
        return self.trackerModuleMap.get(id);
      })));
    },
    fetchTrackerModules: flow(function* () {
      self.trackerModuleMapState = 'pending';
      try {
        const trackers = yield getTrackers();
        self.trackers.forEach(profilesItemTracker => {
          if (!trackers[profilesItemTracker.id]) {
            trackers[profilesItemTracker.id] = JSON.parse(JSON.stringify(profilesItemTracker));
          }
        });
        if (isAlive(self)) {
          self.trackerModuleMap = trackers;
          self.trackerModuleMapState = 'done';
        }
      } catch (err) {
        logger.error('fetchTrackerModules error', err);
        if (isAlive(self)) {
          self.trackerModuleMapState = 'error';
        }
      }
    }),
    addSelectedTrackerId(id) {
      const pos = self.selectedTrackerIds.indexOf(id);
      if (pos === -1) {
        self.selectedTrackerIds.push(id);
        self.setTrackers();
      }
    },
    removeSelectedTrackerId(id) {
      const selectedTrackerIds = self.selectedTrackerIds.slice(0);
      const pos = selectedTrackerIds.indexOf(id);
      if (pos !== -1) {
        selectedTrackerIds.splice(pos, 1);
        self.selectedTrackerIds = selectedTrackerIds;
        self.setTrackers();
      }
    },
    moveTracker(id, prevId, nextId) {
      const items = self.selectedTrackerIds.slice(0);

      const pos = items.indexOf(id);
      if (pos === -1) {
        return;
      }

      items.splice(pos, 1);

      if (prevId) {
        const pos = items.indexOf(prevId);
        if (pos !== -1) {
          items.splice(pos + 1, 0, id);
        }
      } else
      if (nextId) {
        const pos = items.indexOf(nextId);
        if (pos !== -1) {
          items.splice(pos, 0, id);
        }
      } else {
        items.push(id);
      }

      self.selectedTrackerIds = items;
      self.setTrackers();
    }
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
    getTrackersWithFilter(filter, search) {
      let result = self.getTrackersByFilter(filter);
      if (search) {
        const re = new RegExp(escapeStringRegexp(search), 'i');
        result = result.filter(tracker => {
          return re.test([
            tracker.id,
            tracker.meta.name,
            tracker.meta.author,
            tracker.meta.description,
            tracker.meta.homepageURL,
            tracker.meta.trackerURL,
            tracker.meta.updateURL,
            tracker.meta.downloadURL,
            tracker.meta.supportURL,
          ].join(' '));
        });
      }
      return result;
    },
    getTackerModuleById(id) {
      return self.trackerModuleMap.get(id);
    },
    get selectedTackers() {
      return self.selectedTrackerIds.map(id => {
        return self.getTackerModuleById(id);
      });
    },
    get withoutListTackers() {
      return Array.from(self.trackerModuleMap.values()).filter(tracker => {
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
 * @property {function} getProfilePage
 * @property {function} removeProfilePage
 * @property {function} saveProfilePage
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
        const profiles = JSON.parse(JSON.stringify(self.profiles));
        yield new Promise(resolve => chrome.storage.sync.set({profiles}, resolve));
        if (isAlive(self)) {
          self.state = 'done';
        }
      } catch (err) {
        logger.error('save error', err);
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
export {EditProfileItemStore};