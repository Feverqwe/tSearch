import {getRoot, types, getParent} from "mobx-state-tree";
import profileTemplateModel from "../profile/profileTemplate";
import _difference from "lodash.difference";

/**
 * @typedef {ProfileTemplateM} ProfilesEditorProfileM
 * Model:
 * Actions:
 * @property {function(Object)} assign
 * @property {function(string)} changeName
 * @property {function(TrackerM)} addTracker
 * @property {function(string)} removeTracker
 * Views:
 * @property {function(string):TrackerM[]} getTrackersByFilter
 * @property {function:TrackerM[]} getTrackerModulesWithoutList
 * @property {function:string[]} getTrackerIds
 * @property {function:Map<string,ProfileTemplateTrackerM>} getTrackerMap
 * @property {function(string,string,string):Promise} moveTracker
 */

const profilesEditorProfileModel = types.compose('profilesEditorProfileModel', profileTemplateModel, types.model({
  name: types.optional(types.string, '')
})).actions(/**ProfilesEditorProfileM*/self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
    changeName(name) {
      self.name = name;
    },
    addTracker(tracker) {
      const trackerTemplate = self.getTrackerMap().get(tracker.id);
      if (!trackerTemplate) {
        self.trackers.push({
          id: tracker.id,
          meta: {
            name: tracker.name,
            downloadURL: tracker.meta.downloadURL
          }
        });
      }
    },
    removeTracker(trackerId) {
      const trackerTemplate = self.getTrackerMap().get(trackerId);
      const pos = self.trackers.indexOf(trackerTemplate);
      if (pos !== -1) {
        self.trackers.splice(pos, 1);
      }
    },
  };
}).views(/**ProfilesEditorProfileM*/self => {
  return {
    getTrackersByFilter(type) {
      switch (type) {
        case 'all': {
          /**@type IndexM*/
          const indexModel = getRoot(self);
          return indexModel.getTrackerModules();
        }
        case 'selected': {
          return self.getTrackerModules();
        }
        case 'withoutList': {
          return self.getTrackerModulesWithoutList();
        }
      }
    },
    getTrackerModulesWithoutList() {
      /**@type IndexM*/
      const indexModel = getRoot(self);
      return _difference(indexModel.getTrackerModules(), indexModel.getProfilesTrackers());
    },
    getTrackerIds() {
      return self.trackers.map(tracker => tracker.id);
    },
    getTrackerMap() {
      const map = new Map();
      self.trackers.forEach(trackerTemplate => {
        map.set(trackerTemplate.id, trackerTemplate);
      });
      return map;
    },
    moveTracker(id, prevId, nextId) {
      const list = self.trackers.slice(0);
      const map = self.getTrackerMap();

      const item = map.get(id);
      if (!item) return;

      const prevItem = map.get(prevId);
      const nextItem = map.get(nextId);

      const index = list.indexOf(item);

      list.splice(index, 1);

      if (prevItem) {
        const pos = list.indexOf(prevItem);
        if (pos !== -1) {
          list.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = list.indexOf(nextItem);
        if (pos !== -1) {
          list.splice(pos, 0, item);
        }
      } else {
        list.push(item);
      }

      self.assign({trackers: list});
    },
  };
});

export default profilesEditorProfileModel;