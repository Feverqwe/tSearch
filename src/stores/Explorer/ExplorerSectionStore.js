import {flow, getParentOfType, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import ExplorerModuleStore from "./ExplorerModuleStore";
import getLogger from "../../tools/getLogger";
import ExplorerItemStore from "./ExplorerItemStore";
import RootStore from "../RootStore";

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
 * @property {function:Promise} fetchData
 * @property {function} setZoom
 * @property {function} setRowCount
 * @property {function} toggleCollapse
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
}).actions(self => {
  return {
    fetchData: flow(function* () {
      const id = self.id;
      self.state = 'pending';
      try {
        self.module.createWorker();
        const result = yield self.module.worker.getItems();
        const items = result.items || [];
        if (isAlive(self)) {
          self.items = items;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchData error', id, err);
        if (isAlive(self)) {
          self.state = 'error';
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
    }
  };
});

export default ExplorerSectionStore;