import {flow, getParentOfType, isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import ProfileStore, {ProfileTrackerStore} from "./ProfileStore";
import storageSet from "../tools/storageSet";
import TrackerStore from "./TrackerStore";
import RootStore from "./RootStore";
import TrackerStoreStore from "./TrackerStoreStore";

const escapeStringRegexp = require('escape-string-regexp');

const logger = getLogger('ProfileEditorStore');

/**
 * @typedef {ProfileTrackerStore} ProfileEditorProfileTrackerStore
 * @property {string} [updateState]
 * @property {function:Promise} update
 * @property {*} isEditorProfileTrackerStore
 * @property {function} getIconUrl
 */
const ProfileEditorProfileTrackerStore = types.compose('ProfileEditorProfileTrackerStore', ProfileTrackerStore, types.model({
  updateState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
})).actions((self) => {
  return {
    update: flow(function* () {
      self.updateState = 'pending';
      try {
        const result = yield new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'downloadTracker',
            id: self.id,
            updateURL: self.meta.updateURL,
            downloadURL: self.meta.downloadURL,
          }, response => {
            let err = chrome.runtime.lastError;
            err ? reject(err) : resolve(response);
          });
        }).then((response) => {
          if (!response) {
            throw new Error('Response is empty');
          }
          if (response.error) {
            throw Object.assign(new Error(), response.error);
          }
          return response.result;
        });

        logger('download response', result);

        if (isAlive(self)) {
          self.updateState = 'done';
        }
      } catch (err) {
        logger.error('download error', err);
        if (isAlive(self)) {
          self.updateState = 'error';
        }
      }
    })
  };
}).views((self) => {
  return {
    get isEditorProfileTrackerStore() {
      return true;
    },
    getIconUrl() {
      if (self.meta.icon64) {
        return self.meta.icon64;
      } else
      if (self.meta.icon) {
        return self.meta.icon;
      }
      return '';
    }
  };
});

/**
 * @typedef {ProfileStore} ProfileEditorProfileStore
 * @property {ProfileEditorProfileTrackerStore[]} trackers
 * @property {string[]} selectedTrackerIds
 * @property {string} [category]
 * @property {string} [filterText]
 * @property {function} setName
 * @property {function} setCategory
 * @property {function} setFilterText
 * @property {function} setSelectedTrackerIds
 * @property {function} addTracker
 * @property {function} removeTracker
 * @property {function} moveTracker
 * @property {*} trackersMap
 * @property {*} categoryTrackers
 * @property {*} allTrackerIds
 * @property {*} filterTextRe
 * @property {function} getCategoryTrackers
 * @property {function} getCategoryTrackersWithFilter
 * @property {function} getTrackerById
 * @property {function} getProfileTracker
 * @property {function} getTrackerCountByCategory
 * @property {function} getSnapshot
 * @property {function} afterCreate
 */
const ProfileEditorProfileStore = types.compose('ProfileEditorProfileStore', ProfileStore, types.model({
  trackers: types.array(ProfileEditorProfileTrackerStore),
  selectedTrackerIds: types.array(types.string),
  category: types.optional(types.enumeration(['all', 'withoutList', 'selected']), 'selected'),
  filterText: types.optional(types.string, ''),
})).actions((self) => {
  return {
    setName(value) {
      self.name = value;
    },
    setCategory(value) {
      self.category = value;
    },
    setFilterText(value) {
      self.filterText = value;
    },
    setSelectedTrackerIds(ids) {
      self.selectedTrackerIds = ids;
    },
    addTracker(trackerId) {
      const tracker = self.getTrackerById(trackerId);
      if (tracker) {
        if (!self.trackersMap.has(trackerId)) {
          self.trackers.push(JSON.parse(JSON.stringify(tracker)));
        }
        self.selectedTrackerIds.push(trackerId);
      }
    },
    removeTracker(trackerId) {
      self.selectedTrackerIds = self.selectedTrackerIds.filter(id => id !== trackerId);
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
    },
  };
}).views((self) => {
  return {
    get trackersMap() {
      const map = new Map();
      self.trackers.forEach((tracker) => {
        map.set(tracker.id, tracker);
      });
      return map;
    },
    get categoryTrackers() {
      return self.getCategoryTrackersWithFilter(self.category);
    },
    get allTrackerIds() {
      const rootStore = getParentOfType(self, RootStore);
      return self.selectedTrackerIds.concat(Array.from(rootStore.trackers.trackers.keys())).filter((id, index, arr) => {
        return arr.indexOf(id) === index;
      });
    },
    get filterTextRe() {
      return new RegExp(escapeStringRegexp(self.filterText), 'i');
    },
    getCategoryTrackers(value) {
      let ids = null;
      switch (value) {
        case 'all': {
          ids = self.allTrackerIds;
          break;
        }
        case 'withoutList': {
          /**@return ProfileEditorStore*/
          const profileEditorStore = getParentOfType(self, ProfileEditorStore);
          ids = self.allTrackerIds.filter((trackerId) => {
            return !profileEditorStore.profiles.some((profile) => {
              return profile.selectedTrackerIds.indexOf(trackerId) !== -1;
            });
          });
          break;
        }
        case 'selected': {
          ids = self.selectedTrackerIds;
          break;
        }
      }

      let trackers = ids.map((trackerId) => {
        return self.getTrackerById(trackerId);
      });
      
      return trackers;
    },
    getCategoryTrackersWithFilter(value) {
      let trackers = self.getCategoryTrackers(value);
      if (self.filterText) {
        trackers = trackers.filter(tracker => {
          return self.filterTextRe.test([
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
        })
      }
      return trackers;
    },
    getTrackerById(trackerId) {
      return resolveIdentifier(TrackerStore, self, trackerId) || self.getProfileTracker(trackerId);
    },
    getProfileTracker(trackerId) {
      return self.trackersMap.get(trackerId);
    },
    getTrackerCountByCategory(value) {
      return self.getCategoryTrackersWithFilter(value).length;
    },
    getSnapshot() {
      const snapshot = JSON.parse(JSON.stringify(self));
      snapshot.trackers = JSON.parse(JSON.stringify(self.getCategoryTrackers('selected')));
      snapshot.trackers.forEach((tracker) => {
        const profileTracker = self.getProfileTracker(tracker.id);
        if (profileTracker) {
          tracker.options = JSON.parse(JSON.stringify(profileTracker.options));
        }
      });
      return snapshot;
    },
    afterCreate() {
      self.setSelectedTrackerIds(self.trackers.map(tracker => tracker.id));
      if (!self.selectedTrackerIds.length) {
        self.setCategory('all');
      }
    }
  };
});

/**
 * @typedef {{}} ProfileEditorStore
 * @property {string} [saveState]
 * @property {ProfileEditorProfileStore[]} profiles
 * @property {TrackerStoreStore|undefined} trackerStore
 * @property {function:Promise} save
 * @property {function} moveProfile
 * @property {function} removeProfileById
 * @property {function} createProfile
 * @property {function} createTrackerStore
 * @property {function} getProfileById
 */
const ProfileEditorStore = types.model('ProfileEditorStore', {
  saveState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  profiles: types.array(ProfileEditorProfileStore),
  trackerStore: types.maybe(TrackerStoreStore),
}).actions(self => {
  return {
    save: flow(function* () {
      self.saveState = 'pending';
      try {
        const profiles = self.profiles.map(profile => {
          return ProfileStore.create(profile.getSnapshot()).toJSON();
        });
        yield storageSet({profiles}, 'sync');
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
    removeProfileById(id) {
      self.profiles = self.profiles.filter((profile) => {
        return profile.id !== id;
      });
    },
    createProfile(id) {
      self.profiles.push({
        id,
        name: 'New'
      });
    },
    createTrackerStore() {
      self.trackerStore = {};
    }
  };
}).views((self) => {
  return {
    getProfileById(id) {
      let result = null;
      self.profiles.some(profile => {
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