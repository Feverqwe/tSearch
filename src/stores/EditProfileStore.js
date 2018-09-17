import getLogger from "../tools/getLogger";
import {getParentOfType, types} from "mobx-state-tree";
import ProfileStore, {ProfileTrackerStore} from "./ProfileStore";
import RootStore from "./RootStore";
import ProfileEditorStore from "./ProfileEditorStore";

const escapeStringRegexp = require('escape-string-regexp');

const logger = getLogger('ProfileEditorStore');

/**
 * @typedef {ProfileTrackerStore} EditorProfileTrackerStore
 * @property {string} id
 * @property {*} [meta]
 * @property {function} getIconUrl
 */
const EditorProfileTrackerStore = types.compose('EditorProfileTrackerStore', ProfileTrackerStore, types.model({
  id: types.identifier,
})).views(self => {
  return {
    get isEditorProfileTrackerStore() {
      return true;
    },
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
 * @property {EditorProfileTrackerStore[]} trackers
 * @property {string[]} selectedTrackerIds
 * @property {function} setName
 * @property {function} syncTrackers
 * @property {function} save
 * @property {function} addSelectedTrackerId
 * @property {function} removeSelectedTrackerId
 * @property {function} moveTracker
 * @property {function} getTrackersByFilter
 * @property {function} getTrackerIdsWithFilter
 * @property {*} selectedTackers
 * @property {*} withoutListTackers
 * @property {*} editorTrackers
 */
const EditProfileStore = types.compose('EditProfileStore', ProfileStore, types.model({
  name: types.maybeNull(types.string),
  trackers: types.array(EditorProfileTrackerStore),
  selectedTrackerIds: types.array(types.string),
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
    addSelectedTrackerId(id) {
      const pos = self.selectedTrackerIds.indexOf(id);
      if (pos === -1) {
        self.selectedTrackerIds.push(id);
      }
    },
    removeSelectedTrackerId(id) {
      const selectedTrackerIds = self.selectedTrackerIds.slice(0);
      const pos = selectedTrackerIds.indexOf(id);
      if (pos !== -1) {
        selectedTrackerIds.splice(pos, 1);
        self.selectedTrackerIds = selectedTrackerIds;
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
    getTrackerIdsWithFilter(filter, search) {
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
            editorTracker.meta.downloadURL,
            editorTracker.meta.supportURL,
          ].join(' '));
        });
      }
      return result.map(editorTracker => editorTracker.id);
    },
    get selectedTackers() {
      return self.selectedTrackerIds.map(id => {
        return self.editorTrackers.get(id);
      });
    },
    get withoutListTackers() {
      return Array.from(self.editorTrackers.values()).filter(tracker => {
        return self.selectedTrackerIds.indexOf(tracker.id) === -1;
      });
    },
    get editorTrackers() {
      const result = new Map();
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      rootStore.trackers.trackers.forEach((tracker, id) => {
        result.set(id, tracker);
      });
      self.trackers.forEach(profileTracker => {
        const id = profileTracker.id;
        if (!result.has(id)) {
          result.set(profileTracker.id, profileTracker);
        }
      });
      return result;
    },
  };
});

export default EditProfileStore;
export {EditorProfileTrackerStore};