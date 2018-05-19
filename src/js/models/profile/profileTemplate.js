import {types, getSnapshot, getParent, getRoot} from "mobx-state-tree";

/**
 * @typedef {{}} ProfileTemplateM
 * Model:
 * @property {string} name
 * @property {ProfileTemplateTrackerM[]} trackers
 * Actions:
 * @property {function(ProfileTemplateTrackerM[])} setTrackers
 * @property {function(TrackerM)} addTracker
 * @property {function(string)} removeTracker
 * Views:
 * @property {function:Map<string,ProfileTemplateTrackerM>} getTrackerMap
 * @property {function:string[]} getTrackerIds
 * @property {function(string,string,string):Promise} moveTracker
 */

/**
 * @typedef {{}} ProfileTemplateTrackerM
 * Model:
 * @property {string} id
 * @property {{name:string,[downloadURL]:string}} meta
 * Actions:
 * Views:
 * @property {function:TrackerM} initModule
 * @property {function:TrackerM} getModule
 */

const profileTemplateModel = types.model('profileTemplateModel', {
  name: types.identifier(types.string),
  trackers: types.optional(types.array(types.model('profileTemplateTrackerModel', {
    id: types.string,
    meta: types.model('profileItemTrackerMetaModel', {
      name: types.string,
      downloadURL: types.maybe(types.string),
    }),
  }).preProcessSnapshot(snapshot => {
    if (!snapshot.meta) {
      snapshot.meta = {};
    }
    if (!snapshot.meta.name) {
      snapshot.meta.name = snapshot.id;
    }
    return snapshot;
  }).views(self => {
    return {
      initModule() {
        /**@type IndexM*/
        const indexModel = getRoot(self);
        indexModel.initTrackerModule(self.id, getSnapshot(self));
      },
      getModule() {
        /**@type IndexM*/
        const indexModel = getRoot(self);
        self.initModule();
        return indexModel.getTrackerModel(self.id);
      }
    };
  })), []),
}).actions(/**ProfileTemplateM*/self => {
  return {
    setTrackers(trackers) {
      self.trackers = trackers;
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
      return self.save();
    },
    removeTracker(trackerId) {
      const trackerTemplate = self.getTrackerMap().get(trackerId);
      const pos = self.trackers.indexOf(trackerTemplate);
      if (pos !== -1) {
        self.trackers.splice(pos, 1);
      }
      return self.save();
    },
  };
}).views(/**ProfileTemplateM*/self => {
  return {
    save() {
      /**@type IndexM*/
      const indexModel = getParent(self, 2);
      return indexModel.saveProfiles();
    },
    getTrackerMap() {
      const map = new Map();
      self.trackers.forEach(trackerTemplate => {
        map.set(trackerTemplate.id, trackerTemplate);
      });
      return map;
    },
    getTrackerIds() {
      return self.trackers.map(tracker => tracker.id);
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

      self.setTrackers(list);
      return self.save();
    },
  };
});

export default profileTemplateModel;