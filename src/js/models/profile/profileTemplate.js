import {getRoot, getSnapshot, types} from "mobx-state-tree";

/**
 * @typedef {{}} ProfileTemplateM
 * Model:
 * @property {string} name
 * @property {ProfileTemplateTrackerM[]} trackers
 * Actions:
 * Views:
 * @property {function:TrackerM[]} getTrackerModules
 */

/**
 * @typedef {{}} ProfileTemplateTrackerM
 * Model:
 * @property {string} id
 * @property {{name:string,[downloadURL]:string}} meta
 * Actions:
 * Views:
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
      getModule() {
        /**@type IndexM*/
        const indexModel = getRoot(self);
        indexModel.initTrackerModule(self.id, getSnapshot(self));
        return indexModel.getTrackerModel(self.id);
      }
    };
  })), []),
}).views(/**ProfileTemplateM*/self => {
  return {
    getTrackerModules() {
      const modules = [];
      self.trackers.forEach(trackerTemplate => {
        modules.push(trackerTemplate.getModule());
      });
      return modules;
    },
  };
});

export default profileTemplateModel;