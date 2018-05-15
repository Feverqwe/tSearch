import {getParent, types} from "mobx-state-tree";
import processLocale from "../../tools/processLocale";

const debug = require('debug')('moduleMeta');

/**
 * @typedef {{}} ExploreModuleMetaActionM
 * Model:
 * @property {string} icon
 * @property {string} title
 * @property {*} command
 * @property {boolean} isLoading
 * Actions:
 * @property {function(boolean)} setLoading
 * Views:
 * @property {function:string} getTitle
 * @property {function} handleClick
 */

const exploreModuleMetaActionModel = types.model('exploreModuleMetaActionModel', {
  icon: types.string,
  title: types.string,
  command: types.frozen,
  isLoading: types.boolean,
}).preProcessSnapshot(snapshot => {
  snapshot.isLoading = false;
  return snapshot;
}).actions(/**ExploreModuleMetaActionM*/self => {
  return {
    setLoading(state) {
      self.isLoading = state;
    },
  };
}).views(/**ExploreModuleMetaActionM*/self => {
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

export default exploreModuleMetaActionModel;