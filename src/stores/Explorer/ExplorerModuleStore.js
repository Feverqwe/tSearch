import {types} from "mobx-state-tree";
import {TrackerOptionsStore} from "../TrackerStore";
import ExplorerModuleWorker from "../../tools/explorerModuleWorker";
import ExplorerModuleMetaStore from "./ExplorerModuleMetaStore";
import getLogger from "../../tools/getLogger";

const logger = getLogger('ExplorerModuleStore');

/**
 * @typedef {{}} ExplorerModuleStore
 * @property {string} id
 * @property {TrackerOptionsStore} [options]
 * @property {ExplorerModuleMetaStore} meta
 * @property {string} code
 * @property {function} setOptions
 * @property {*} worker
 * @property {function} createWorker
 * @property {function} destroyWorker
 * @property {function} reloadWorker
 * @property {function} beforeDestroy
 */
const ExplorerModuleStore = types.model('ExplorerModuleStore', {
  id: types.identifier,
  options: types.optional(TrackerOptionsStore, {}),
  meta: ExplorerModuleMetaStore,
  code: types.string
}).actions(/**ExplorerModuleStore*/self => {
  return {
    setOptions(value) {
      self.options = value;
    }
  };
}).views(/**ExplorerModuleStore*/self => {
  let worker = null;
  return {
    get worker() {
      return worker;
    },
    createWorker() {
      if (!worker) {
        worker = new ExplorerModuleWorker(self.toJSON());
      }
    },
    destroyWorker() {
      if (worker) {
        worker.destroy();
      }
      worker = null;
    },
    reloadWorker() {
      if (worker) {
        self.destroyWorker();
        self.createWorker();
      }
    },
    beforeDestroy() {
      self.destroyWorker();
    }
  };
});

export default ExplorerModuleStore;