import trackerModel from '../tracker';
import {types, resolveIdentifier, getRoot, getSnapshot} from "mobx-state-tree";
import getLogger from "../../../../src/tools/getLogger";

const debug = getLogger('profileTracker');

/**
 * @typedef {{}} ProfileTrackerM
 * Model:
 * @property {string} state
 * @property {string} id
 * @property {ProfileTrackerMetaM} meta
 * @property {boolean} selected
 * Actions:
 * @property {function} toggleSelect
 * @property {function(boolean)} setSelected
 * @property {function(boolean)} applySelected
 * Views:
 * @property {Promise} readyPromise
 * @property {TrackerM} trackerModule
 * @property {function(number):TrackerResultM[]} getSearchResultsPage
 * @property {function:number} getSearchPageCount
 * @property {function:string} getIconClassName
 * @property {function} beforeDestroy
 */

/**
 * @typedef {{}} ProfileTrackerMetaM
 * Model:
 * @property {string} name
 * @property {string} [downloadURL]
 * Actions:
 * Views:
 */

const profileTrackerMetaModel = types.model('profileTrackerMetaModel', {
  name: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
});

const profileTrackerModel = types.model('profileTrackerModel', {
  id: types.identifier(types.string),
  meta: types.optional(profileTrackerMetaModel, {}),
  selected: types.optional(types.boolean, false),
}).actions(/**ProfileTrackerM*/self => {
  return {
    toggleSelect() {
      self.selected = !self.selected;
    },
    setSelected(value) {
      self.selected = value;
    }
  };
}).views(/**ProfileTrackerM*/self => {
  return {
    get state() {
      return self.trackerModule.state;
    },
    get readyPromise() {
      return self.trackerModule.readyPromise;
    },
    get trackerModule() {
      return resolveIdentifier(trackerModel, self, self.id);
    },
    afterCreate() {
      const indexModel = /**IndexM*/getRoot(self);
      indexModel.initTrackerModule(self.id, getSnapshot(self));
    },
    beforeDestroy() {
      self.trackerModule.destroyWorker();
    },
  };
});

export default profileTrackerModel;