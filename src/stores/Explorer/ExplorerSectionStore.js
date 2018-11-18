import {flow, getParentOfType, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import ExplorerModuleStore from "./ExplorerModuleStore";
import getLogger from "../../tools/getLogger";
import ExplorerItemStore from "./ExplorerItemStore";
import RootStore from "../RootStore";
import {ErrorWithCode} from "../../tools/errors";

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
      self.authRequired = undefined;
      try {
        if (!self.module) {
          throw new Error(`Module is not exists`);
        }
        self.module.createWorker();
        const result = yield self.module.worker.getItems();
        if (!result) {
          throw new ErrorWithCode(`Result is empty`, 'EMPTY_RESULT');
        }
        if (!result.success) {
          throw new ErrorWithCode(`Result is not success`, 'NOT_SUCCESS');
        }
        if (isAlive(self)) {
          self.items = result.items;
          self.state = 'done';
        }
      } catch (err) {
        if (err.code === 'AUTH_REQUIRED') {
          if (isAlive(self)) {
            self.setAuthRequired(err.url);
          }
        } else {
          logger.error('fetchData error', id, err);
          if (isAlive(self)) {
            self.state = 'error';
          }
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
    setAuthRequired(url) {
      self.authRequired = {url};
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