import {flow, isAlive, types} from "mobx-state-tree";


/**
 * @typedef {{}} ExplorerSectionStore
 * @property {string} id
 */
const ExplorerSectionStore = types.model('ExplorerSectionStore', {
  id: types.identifier,
});


/**
 * @typedef {{}} ExplorerStore
 * @property {string} [state]
 * @property {ExplorerSectionStore[]|undefined} sections
 * @property {function} fetchSections
 */
const ExplorerStore = types.model('ExplorerStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  sections: types.maybe(types.array(ExplorerSectionStore)),
}).actions(self => {
  return {
    fetchSections: flow(function* () {
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
  return {};
});

export default ExplorerStore;