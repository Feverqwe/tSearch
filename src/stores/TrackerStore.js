import {flow, isAlive, onPatch, types} from 'mobx-state-tree';
import TrackerWorker from "../tools/trackerWorker";
import getLogger from "../tools/getLogger";

const logger = getLogger('TrackerStore');

/**
 * @typedef {{}} TrackerOptionsStore
 * @property {number} [lastUpdate]
 * @property {boolean} [autoUpdate]
 * @property {boolean} [enableProxy]
 */
const TrackerOptionsStore = types.model('TrackerOptionsStore', {
  lastUpdate: types.optional(types.number, 0),
  autoUpdate: types.optional(types.boolean, true),
  enableProxy: types.optional(types.boolean, false),
});

/**
 * @typedef {{}} TrackerMetaStore
 * @property {string} name
 * @property {string|undefined} version
 * @property {string|undefined} author
 * @property {string|undefined} description
 * @property {string|undefined} homepageURL
 * @property {string|undefined} icon
 * @property {string|undefined} icon64
 * @property {string|undefined} trackerURL
 * @property {string|undefined} downloadURL
 * @property {string|undefined} supportURL
 * @property {string[]} [require]
 * @property {string[]} [connect]
 */
const TrackerMetaStore = types.model('TrackerMetaStore', {
  name: types.string,
  version: types.maybe(types.string),
  author: types.maybe(types.string),
  description: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  icon: types.maybe(types.string),
  icon64: types.maybe(types.string),
  trackerURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
  supportURL: types.maybe(types.string),
  require: types.optional(types.array(types.string), []),
  connect: types.optional(types.array(types.string), []),
});

/**
 * @typedef {{}} TrackerStore
 * @property {string} [updateState]
 * @property {string} id
 * @property {TrackerOptionsStore} [options]
 * @property {TrackerMetaStore} meta
 * @property {string} code
 * @property {function} setOptions
 * @property {function:Promise} update
 * @property {function} getSnapshot
 * @property {function} getIconUrl
 * @property {*} attached
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
const TrackerStore = types.model('TrackerStore', {
  updateState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  id: types.identifier,
  options: types.optional(TrackerOptionsStore, {}),
  meta: TrackerMetaStore,
  code: types.string
}).actions(self => {
  return {
    setOptions(value) {
      self.options = value;
    },
    update: flow(function* () {
      self.updateState = 'pending';
      try {
        const result = yield new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'updateTracker',
            id: self.id,
          }, response => {
            let err = chrome.runtime.lastError;
            err ? reject(err) : resolve(response);
          });
        }).then((response) => {
          if (!response) {
            throw new Error('Response is empty');
          }
          if (response.error) {
            throw Object.assign(new Error(), response.error);
          }
          return response.result;
        }).catch((err) => {
          if (err.code !== 'NEW_VERSION_IS_NOT_FOUND') {
            throw err;
          }
        });

        logger('update response', result);

        if (isAlive(self)) {
          self.updateState = 'done';
        }
      } catch (err) {
        logger.error('update error', err);
        if (isAlive(self)) {
          self.updateState = 'error';
        }
      }
    })
  };
}).views(self => {
  let attached = 0;
  let worker = null;
  return {
    getSnapshot() {
      const snapshot = JSON.parse(JSON.stringify(self));
      delete snapshot.updateState;
      return snapshot;
    },
    getIconUrl() {
      if (self.meta.icon64) {
        return self.meta.icon64;
      } else if (self.meta.icon) {
        return self.meta.icon;
      }
      return '';
    },
    get attached() {
      return attached;
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
        worker = new TrackerWorker(self.toJSON());
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
        if (/^\/(code|meta\/connect\/\d+|options\/enableProxy)$/.test(patch.path)) {
          self.reloadWorker();
        }
      });
    },
    beforeDestroy() {
      self.destroyWorker();
    }
  };
});

export default TrackerStore;
export {TrackerOptionsStore, TrackerMetaStore};