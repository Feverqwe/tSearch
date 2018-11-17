import {flow, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import ExplorerModuleStore from "./ExplorerModuleStore";

/**
 * @typedef {{}} ExplorerSectionStore
 * @property {string} id
 * @property {string} [state]
 * @property {boolean} [collapsed]
 * @property {function:Promise} fetchData
 * @property {*} module
 */
const ExplorerSectionStore = types.model('ExplorerSectionStore', {
  id: types.identifier,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  collapsed: types.optional(types.boolean, false),
  authRequired: types.maybe(types.model({
    url: types.string
  })),
}).actions(self => {
  return {
    fetchData: flow(function* () {
      self.state = 'pending';
      try {

        if (isAlive(self)) {
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchSections error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
  };
}).views(self => {
  return {
    get module() {
      if (isAlive(self)) {
        return resolveIdentifier(ExplorerModuleStore, self, self.id);
      }
    }
  };
});

export default ExplorerSectionStore;