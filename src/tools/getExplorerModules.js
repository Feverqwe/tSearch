import getLogger from "./getLogger";
import {destroy} from "mobx-state-tree";
import getExplorerModulesJson from "./getExplorerModulesJson";
import loadLocalExplorerModule from "./loadLocalExplorerModule";
import {ExplorerModuleStore} from "../stores/ExplorerStore";

const compareVersions = require('compare-versions');

const logger = getLogger('getExplorerModules');

const getExplorerModules = () => {
  return Promise.all([
    getExplorerModulesJson(),
    new Promise(resolve => chrome.storage.local.get({explorerModules: {}}, resolve)).then(storage => storage.explorerModules)
  ]).then(([idLocalVersion, idModule]) => {
    let storageChanged = false;
    const ids = Object.keys(idLocalVersion).concat(Object.keys(idModule));
    const idsUnic = ids.filter((id, index) => ids.indexOf(id) === index);
    return Promise.all(idsUnic.map(id => {
      let module = idModule[id];

      const localVersion = idLocalVersion[id];
      if (localVersion && module) {
        let localIsHigher = true;
        try {
          localIsHigher = compareVersions(localVersion, module.meta.version) > 0;
        } catch (err) {
          logger.error('compareVersions error', id, err);
        }
        if (localIsHigher) {
          module = null;
          delete idModule[id];
        }
      }

      if (!module) {
        return loadLocalExplorerModule(id).then(localTracker => {
          const moduleStore = ExplorerModuleStore.create(localTracker);
          const module = moduleStore.toJSON();
          destroy(moduleStore);

          storageChanged = true;
          return idModule[id] = module;
        }, err => {
          logger.error('loadLocalExplorerModule error', id, err);
        });
      }
    })).then(() => {
      if (storageChanged) {
        return new Promise(resolve => chrome.storage.local.set({explorerModules: idModule}, resolve)).then(() => idModule);
      } else {
        return idModule;
      }
    });
  });
};

export default getExplorerModules;