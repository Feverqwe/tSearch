import {getParentOfType, types} from "mobx-state-tree";
import processLocale from "../../tools/processLocale";
import ExplorerModuleMetaStore from "./ExplorerModuleMetaStore";

/**
 * @typedef {{}} ExplorerModuleMetaActionStore
 * @property {string} icon
 * @property {string} title
 * @property {*} command
 * @property {function} getTitle
 */
const ExplorerModuleMetaActionStore = types.model('ExplorerModuleMetaActionStore', {
  icon: types.string,
  title: types.string,
  command: types.frozen(),
}).views(self => {
  return {
    getTitle() {
      const moduleMetaStore = /**ExplorerModuleMetaStore*/getParentOfType(self, ExplorerModuleMetaStore);
      return processLocale(self.title, moduleMetaStore.getLocale());
    },
  };
});

export default ExplorerModuleMetaActionStore;