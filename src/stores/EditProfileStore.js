import getLogger from "../tools/getLogger";
import {flow, getParentOfType, isAlive, types} from "mobx-state-tree";
import ProfileStore from "./ProfileStore";
import RootStore from "./RootStore";
import getTrackers from "../tools/getTrackers";
import ProfileEditorStore from "./ProfileEditorStore";

const escapeStringRegexp = require('escape-string-regexp');

const logger = getLogger('ProfileEditorStore');

/**
 * @typedef {{}} EditorTrackerStore
 * @property {string} id
 * @property {*} [meta]
 * @property {function} getIconUrl
 */
const EditorProfileTrackerStore = types.model('EditorTrackerStore', {
  id: types.identifier,
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
 * @typedef {ProfileStore} EditProfileStore
 * @property {string|undefined|null} name
 * @property {string} [state]
 * @property {string[]} selectedTrackerIds
 * @property {Map<*,EditorProfileTrackerStore>|undefined|null} editorTrackers
 * @property {function} setName
 * @property {function} syncTrackers
 * @property {function} save
 * @property {function:Promise} fetchEditorTrackers
 * @property {function} addSelectedTrackerId
 * @property {function} removeSelectedTrackerId
 * @property {function} moveTracker
 * @property {function} getTrackersByFilter
 * @property {function} getTrackersWithFilter
 * @property {function} getTackerModuleById
 * @property {*} selectedTackers
 * @property {*} withoutListTackers
 */
const EditProfileStore = types.compose('EditProfileStore', ProfileStore, types.model({
  name: types.maybeNull(types.string),
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  selectedTrackerIds: types.array(types.string),
  editorTrackers: types.maybeNull(types.map(EditorProfileTrackerStore)),
})).actions(self => {
  return {
    setName(name) {
      self.name = name;
    },
    syncTrackers() {
      self.trackers = self.selectedTrackerIds.map(id => {
        return self.editorTrackers.get(id).toJSON();
      });
    },
    save() {
      self.syncTrackers();
      const /**ProfileEditorStore*/profileEditorStore = getParentOfType(self, ProfileEditorStore);
      profileEditorStore.saveProfilePage(self.id);
    },
    fetchEditorTrackers: flow(function* () {
      self.state = 'pending';
      try {
        const /**RootStore*/rootStore = getParentOfType(self, RootStore);
        const trackers = yield getTrackers();
        self.trackers.forEach(profileTracker => {
          if (!trackers[profileTracker.id]) {
            trackers[profileTracker.id] = profileTracker.toJSON();
          }
        });
        if (isAlive(self)) {
          self.editorTrackers = trackers;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchTrackerModules error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    addSelectedTrackerId(id) {
      const pos = self.selectedTrackerIds.indexOf(id);
      if (pos === -1) {
        self.selectedTrackerIds.push(id);
        self.syncTrackers();
      }
    },
    removeSelectedTrackerId(id) {
      const selectedTrackerIds = self.selectedTrackerIds.slice(0);
      const pos = selectedTrackerIds.indexOf(id);
      if (pos !== -1) {
        selectedTrackerIds.splice(pos, 1);
        self.selectedTrackerIds = selectedTrackerIds;
        self.syncTrackers();
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
      self.syncTrackers();
    },
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
        result = result.filter(editorTracker => {
          return re.test([
            editorTracker.id,
            editorTracker.meta.name,
            editorTracker.meta.author,
            editorTracker.meta.description,
            editorTracker.meta.homepageURL,
            editorTracker.meta.trackerURL,
            editorTracker.meta.updateURL,
            editorTracker.meta.downloadURL,
            editorTracker.meta.supportURL,
          ].join(' '));
        });
      }
      return result;
    },
    getTackerModuleById(id) {
      return self.editorTrackers.get(id);
    },
    get selectedTackers() {
      return self.selectedTrackerIds.map(id => {
        return self.getTackerModuleById(id);
      });
    },
    get withoutListTackers() {
      return Array.from(self.editorTrackers.values()).filter(tracker => {
        return self.selectedTrackerIds.indexOf(tracker.id) === -1;
      });
    },
  };
});

export default EditProfileStore;
export {EditorProfileTrackerStore};