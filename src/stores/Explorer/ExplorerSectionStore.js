import {flow, getParentOfType, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import ExplorerModuleStore from "./ExplorerModuleStore";
import getLogger from "../../tools/getLogger";
import ExplorerItemStore from "./ExplorerItemStore";
import RootStore from "../RootStore";
import ExplorerCommandStore from "./ExplorerCommandStore";
import getNow from "../../tools/getNow";

const promiseLimit = require('promise-limit');

const logger = getLogger('ExplorerSectionStore');
const limitOne = promiseLimit(1);

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
 * @property {function} setState
 * @property {function:Promise} fetch
 * @property {function} setZoom
 * @property {function} setRowCount
 * @property {function} toggleCollapse
 * @property {function} setAuthRequired
 * @property {function} setItems
 * @property {function} createCommand
 * @property {*} module
 * @property {function} getSnapshot
 * @property {*} page
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
          cacheItems = yield fromCache(id, module.meta.cacheTTL);
        }
        let result = {items: cacheItems};
        if (!cacheItems) {
          module.attach();
          result = yield fn().finally(() => {
            module.deattach();
          });
        }
        if (!cacheItems && result.items) {
          limitOne(() => {
            return inCache(id, result.items);
          });
        }
        if (isAlive(self)) {
          if (result.items) {
            self.setItems(result.items);
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
  };
}).views(self => {
  return {
    get module() {
      if (isAlive(self)) {
        return resolveIdentifier(ExplorerModuleStore, self, self.id);
      }
    },
    getSnapshot() {
      return {
        id: self.id,
        collapsed: self.collapsed,
        rowCount: self.rowCount,
        zoom: self.zoom,
      };
    },
    get page() {
      if (isAlive(self)) {
        return getParentOfType(self, RootStore).page;
      }
    },
    fetchData() {
      const module = self.module;
      return self.fetch(self, true, () => {
        return module.worker.getItems();
      });
    },
    fetchCommand(commandStore, actionStore) {
      const module = self.module;
      const command = actionStore.command;
      return self.fetch(commandStore, false, () => {
        return module.worker.sendCommand(command);
      });
    },
  };
});

const inCache = async (key, value) => {
  const storage = await new Promise(resolve => chrome.storage.local.get({
    explorerCache: {}
  }, resolve));
  storage.explorerCache[key] = {
    value,
    createdAt: getNow(),
  };
  return await new Promise(resolve => chrome.storage.local.set(storage, resolve));
};

const fromCache = async (key, ttl) => {
  const storage = await new Promise(resolve => chrome.storage.local.get({
    explorerCache: {}
  }, resolve));
  const item = storage.explorerCache[key];
  if (item && (!ttl || item.createdAt > getNow() - ttl)) {
    return item.value;
  }
};

export default ExplorerSectionStore;