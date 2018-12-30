import {onPatch, types} from "mobx-state-tree";
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
 * @property {function} getSnapshot
 * @property {*} worker
 * @property {function} attach
 * @property {function} deattach
 * @property {function} handleAttachedChange
 * @property {function} createWorker
 * @property {function} destroyWorker
 * @property {function} reloadWorker
 * @property {function} afterCreate
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
  let attached = 0;
  let worker = null;
  return {
    getSnapshot() {
      return JSON.parse(JSON.stringify(self));
    },
    get worker() {
      return worker;
    },
    attach() {
      attached++;
      self.handleAttachedChange();
    },
    deattach() {
      attached--;
      setTimeout(() => {
        self.handleAttachedChange();
      }, 1);
    },
    handleAttachedChange() {
      if (attached) {
        self.createWorker();
      } else {
        self.destroyWorker();
      }
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
    afterCreate() {
      onPatch(self, (patch) => {
        if (/^\/(code|options\/enableProxy)$/.test(patch.path)) {
          self.reloadWorker();
        }
      });
    },
    beforeDestroy() {
      self.destroyWorker();
    }
  };
});

export default ExplorerModuleStore;