import {applyPatch, flow, getParentOfType, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import ExplorerModuleStore from "./ExplorerModuleStore";
import getLogger from "../../tools/getLogger";
import ExplorerItemStore from "./ExplorerItemStore";
import RootStore from "../RootStore";
import ExplorerCommandStore from "./ExplorerCommandStore";
import ExplorerCache from "../../tools/explorerCache";
import parseModuleParams from "../../tools/parseModuleParams";
import promiseFinally from "../../tools/promiseFinally";

const logger = getLogger('ExplorerSectionStore');

const cache = new ExplorerCache();

/**
 * @typedef {{}} ExplorerSectionStore
 * @property {string} id
 * @property {string} [state]
 * @property {boolean} [collapsed]
 * @property {number} [rowCount]
 * @property {number} [zoom]
 * @property {{url:string}|undefined} authRequired
 * @property {ExplorerItemStore[]} items
 * @property {Map<*,ExplorerCommandStore>} commands
 * @property {string} moduleId
 * @property {string} [moduleParams]
 * @property {function} setState
 * @property {function:Promise} fetch
 * @property {function} setZoom
 * @property {function} setRowCount
 * @property {function} toggleCollapse
 * @property {function} setAuthRequired
 * @property {function} setItems
 * @property {function} createCommand
 * @property {function} patchItems
 * @property {*} module
 * @property {function} getSnapshot
 * @property {function} getItemsSnapshot
 * @property {*} page
 * @property {*} prepModuleParams
 * @property {function} fetchData
 * @property {function} fetchCommand
 */
const ExplorerSectionStore = types.model('ExplorerSectionStore', {
  id: types.identifier,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  collapsed: types.optional(types.boolean, false),
  rowCount: types.optional(types.number, 2),
  zoom: types.optional(types.number, 100),
  authRequired: types.maybe(types.model({
    url: types.string
  })),
  items: types.array(ExplorerItemStore),
  commands: types.map(ExplorerCommandStore),
  moduleId: types.string,
  moduleParams: types.optional(types.string, ''),
}).actions(self => {
  return {
    setState(state) {
      self.state = state;
    },
    fetch: flow(function* (stateStore, useCache, fn) {
      const id = self.id;
      const module = self.module;
      stateStore.setState('pending');
      self.setAuthRequired();
      try {
        if (!module) {
          throw new Error(`Module is not exists`);
        }
        let cacheItems = null;
        if (useCache) {
          cacheItems = yield cache.get(id, module.meta.cacheTTL);
        }
        let result = {items: cacheItems};
        if (!cacheItems) {
          module.attach();
          result = yield fn().then(...promiseFinally(() => {
            module.deattach();
          }));
        }
        if (isAlive(self)) {
          if (result.items) {
            self.setItems(result.items);
            if (!cacheItems) {
              cache.set(id, self.getItemsSnapshot());
            }
          }
        }
        if (isAlive(stateStore)) {
          stateStore.setState('done');
        }
      } catch (err) {
        if (err.code === 'AUTH_REQUIRED') {
          if (isAlive(self)) {
            self.setAuthRequired({url: err.url});
          }
        } else {
          logger.error('fetch error', id, err);
        }
        if (isAlive(stateStore)) {
          stateStore.setState('error');
        }
      }
    }),
    setZoom(value) {
      self.zoom = value;
    },
    setRowCount(value) {
      self.rowCount = value;
    },
    toggleCollapse() {
      self.collapsed = !self.collapsed;
    },
    setAuthRequired(obj) {
      self.authRequired = obj;
    },
    setItems(items) {
      self.items = items;
    },
    createCommand(index) {
      self.commands.set(index, {index});
    },
    patchItems(patch) {
      applyPatch(self.items, patch);
    }
  };
}).views(self => {
  return {
    get module() {
      if (isAlive(self) && self.moduleId) {
        return resolveIdentifier(ExplorerModuleStore, self, self.moduleId);
      }
    },
    getSnapshot() {
      return {
        id: self.id,
        collapsed: self.collapsed,
        rowCount: self.rowCount,
        zoom: self.zoom,
        moduleId: self.moduleId,
        moduleParams: self.moduleParams,
      };
    },
    getItemsSnapshot() {
      return self.items.map(item => {
        return item.toJSON();
      });
    },
    get page() {
      if (isAlive(self)) {
        return getParentOfType(self, RootStore).page;
      }
    },
    get prepModuleParams() {
      let moduleParams = self.moduleParams;
      if (/%kpFolderId%/.test(moduleParams)) {
        const rootStore = getParentOfType(self, RootStore);
        moduleParams = moduleParams.replace('%kpFolderId%', rootStore.options.options.kpFolderId);
      }
      return moduleParams;
    },
    fetchData(force) {
      const module = self.module;
      const useCache = !force;
      return self.fetch(self, useCache, () => {
        return module.worker.getItems(parseModuleParams(self.prepModuleParams));
      });
    },
    fetchCommand(commandStore, actionStore) {
      const module = self.module;
      const command = actionStore.command;
      return self.fetch(commandStore, false, () => {
        return module.worker.sendCommand(command, parseModuleParams(self.prepModuleParams));
      });
    }
  };
});

export default ExplorerSectionStore;