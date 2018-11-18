import {flow, getParentOfType, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import ExplorerModuleStore from "./ExplorerModuleStore";
import getLogger from "../../tools/getLogger";
import ExplorerItemStore from "./ExplorerItemStore";
import RootStore from "../RootStore";
import ExplorerCommandStore from "./ExplorerCommandStore";

const logger = getLogger('ExplorerSectionStore');

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
 * @property {function:Promise} fetchData
 * @property {function:Promise} fetchCommand
 * @property {function} setZoom
 * @property {function} setRowCount
 * @property {function} toggleCollapse
 * @property {function} setAuthRequired
 * @property {function} setItems
 * @property {function} createCommand
 * @property {*} module
 * @property {function} getSnapshot
 * @property {*} page
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
    fetchData: flow(function* () {
      const id = self.id;
      self.state = 'pending';
      self.setAuthRequired();
      try {
        if (!self.module) {
          throw new Error(`Module is not exists`);
        }
        self.module.createWorker();
        const result = yield self.module.worker.getItems();
        if (isAlive(self)) {
          if (result.items) {
            self.setItems(result.items);
          }
          self.state = 'done';
        }
      } catch (err) {
        if (err.code === 'AUTH_REQUIRED') {
          if (isAlive(self)) {
            self.setAuthRequired({url: err.url});
          }
        } else {
          logger.error('fetchData error', id, err);
        }
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    fetchCommand: flow(function* (commandStore, actionStore) {
      const command = actionStore.command;
      commandStore.setState('pending');
      self.setAuthRequired();
      try {
        if (!self.module) {
          throw new Error(`Module is not exists`);
        }
        self.module.createWorker();
        const result = yield self.module.worker.sendCommand(command);
        if (isAlive(self)) {
          if (result.items) {
            self.setItems(result.items);
          }
          commandStore.setState('done');
        }
      } catch (err) {
        if (err.code === 'AUTH_REQUIRED') {
          if (isAlive(self)) {
            self.setAuthRequired({url: err.url});
          }
        } else {
          logger.error('fetchCommand error', command, err);
        }
        if (isAlive(self)) {
          commandStore.setState('error');
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
  };
});

export default ExplorerSectionStore;