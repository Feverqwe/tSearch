import {types, getParent} from "mobx-state-tree";
import processLocale from "../../tools/processLocale";

/**
 * @typedef {{}} ExplorerModuleMetaActionStore
 * @property {string} icon
 * @property {string} title
 * @property {*} command
 * @property {boolean} isLoading
 * @property {function} setLoading
 * @property {function} getTitle
 * @property {function} handleClick
 */
const ExplorerModuleMetaActionStore = types.model('ExplorerModuleMetaActionStore', {
  icon: types.string,
  title: types.string,
  command: types.frozen(),
  isLoading: types.boolean,
}).preProcessSnapshot(snapshot => {
  snapshot.isLoading = false;
  return snapshot;
}).actions(self => {
  return {
    setLoading(state) {
      self.isLoading = state;
    },
  };
}).views(self => {
  return {
    getTitle() {
      const sectionMeta = /**ExploreModuleMetaM*/getParent(self, 2);
      return processLocale(self.title, sectionMeta.getLocale());
    },
    handleClick(e) {
      e.preventDefault();

      if (!self.isLoading) {
        self.setLoading(true);
        const module = /**ExploreModuleM*/getParent(self, 3);
        module.sendCommand(self.command).finally(() => {
          self.setLoading(false);
        }).catch(err => {
          debug('handleClick error', self.command, err);
        });
      }
    }
  };
});

export default ExplorerModuleMetaActionStore;