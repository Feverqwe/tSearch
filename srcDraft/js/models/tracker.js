import {applySnapshot, getSnapshot, types} from "mobx-state-tree";
import TrackerWorker from "../../../src/tools/trackerWorker";
import promisifyApi from "../../../src/tools/promisifyApi";
import loadTrackerModule from "../../../src/tools/loadTrackerModule";
import getTrackersJson from "../../../src/tools/getTrackersJson";
import getTrackerCodeMeta from "../../../src/tools/getTrackerCodeMeta";
import _isEqual from "lodash.isequal";
import getLogger from "../../../src/tools/getLogger";

const compareVersions = require('compare-versions');

const debug = getLogger('trackerModel');

/**
 * @typedef {{}} TrackerM
 * Model:
 * @property {string} state
 * @property {string} id
 * @property {TrackerMetaM} meta
 * @property {TrackerInfoM} info
 * @property {string} code
 * Actions:
 * @property {function(Object)} assign
 * @property {function(boolean)} setAutoUpdate
 * Views:
 * @property {Promise} readyPromise
 * @property {function:Promise} save
 * @property {function:Promise} remove
 * @property {function:Object} getSnapshot
 * @property {function(string)} setCode
 * @property {function:boolean} isLoaded
 * @property {function:string} getIconUrl
 * @property {string} storageKey
 * @property {function:TrackerWorker} getWorker
 * @property {function} destroyWorker
 */

/**
 * @typedef {{}} TrackerMetaM
 * Model:
 * @property {string} name
 * @property {string} version
 * @property {string} [author]
 * @property {string} [description]
 * @property {string} [homepageURL]
 * @property {string} [icon]
 * @property {string} [icon64]
 * @property {string} [trackerURL]
 * @property {string} [updateURL]
 * @property {string} [downloadURL]
 * @property {string} [supportURL]
 * @property {string[]} require
 * @property {string[]} connect
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} TrackerInfoM
 * Model:
 * @property {number} lastUpdate
 * @property {boolean} disableAutoUpdate
 * Actions:
 * Views:
 */


const trackerMetaModel = types.model('trackerMetaModel', {
  name: types.string,
  version: types.maybe(types.string),
  author: types.maybe(types.string),
  description: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  icon: types.maybe(types.string),
  icon64: types.maybe(types.string),
  trackerURL: types.maybe(types.string),
  updateURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
  supportURL: types.maybe(types.string),
  require: types.optional(types.array(types.string), []),
  connect: types.optional(types.array(types.string), []),
});

const trackerModel = types.model('trackerModel', {
  state: types.optional(types.string, 'idle'),
  id: types.identifier(types.string),
  meta: trackerMetaModel,
  info: types.optional(types.model('trackerInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }), {}),
  code: types.maybe(types.string),
}).preProcessSnapshot(snapshot => {
  if (snapshot) {
    if (!snapshot.meta) {
      snapshot.meta = {};
    }
    if (!snapshot.meta.name) {
      snapshot.meta.name = snapshot.id;
    }
  }
  return snapshot;
}).actions(/**TrackerM*/self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
    setAutoUpdate(state) {
      self.info.disableAutoUpdate = !state;
    }
  };
}).views(/**TrackerM*/self => {
  let worker = null;
  let readyPromise = null;

  const handleTrackerChangeListener = (changes, namespace) => {
    if (namespace === 'local') {
      const change = changes[self.storageKey];
      if (change) {
        const module = change.newValue;
        if (!_isEqual(module, self.getSnapshot())) {
          debug('Sync with storage', self.id);
          self.destroyWorker();
          if (module) {
            applySnapshot(self, module);
            self.assign({state: 'success'});
          } else {
            applySnapshot(self, {id: self.id});
            self.assign({state: 'error'});
          }
        }
      }
    }
  };

  const mustBeLoaded = () => {
    if (!self.isLoaded()) {
      throw new Error('Tracker is not loaded');
    }
  };

  return {
    get readyPromise() {
      return readyPromise;
    },
    isLoaded() {
      return self.state === 'success';
    },
    get isAutoUpdate() {
      return !self.info.disableAutoUpdate;
    },
    getWorker() {
      mustBeLoaded();
      if (!worker) {
        worker = new TrackerWorker(self.getSnapshot(self));
      }
      return worker;
    },
    destroyWorker() {
      if (worker) {
        worker.destroy();
        worker = null;
      }
    },
    getIconUrl() {
      mustBeLoaded();
      if (self.meta.icon64) {
        return self.meta.icon64;
      } else if (self.meta.icon) {
        return self.meta.icon;
      }
      return '';
    },
    get storageKey() {
      return `trackerModule_${self.id}`;
    },
    getSnapshot() {
      const snapshot = Object.assign({}, getSnapshot(self));
      delete snapshot.state;
      return snapshot;
    },
    save() {
      return promisifyApi('chrome.storage.local.set')({[self.storageKey]: self.getSnapshot()});
    },
    remove() {
      return promisifyApi('chrome.storage.local.remove')([self.storageKey]);
    },
    setCode(code) {
      self.assign({
        meta: getTrackerCodeMeta(code),
        code: code
      });
    },
    afterCreate() {
      self.assign({state: 'loading'});
      readyPromise = Promise.resolve().then(async () => {
        const trackersJson = getTrackersJson();

        const key = self.storageKey;
        let module = await promisifyApi('chrome.storage.local.get')({
          [key]: null
        }).then(storage => storage[key]);

        if (module && trackersJson[self.id]) {
          let isHigher = true;
          try {
            isHigher = compareVersions(trackersJson[self.id], module.meta.version) > 0;
          } catch (err) {
            debug('Version compare error', self.id, err);
          }
          if (isHigher) {
            debug('Local module version is higher then in storage', self.id);
            module = null;
          }
        }

        let saveInStore = false;
        if (!module) {
          module = await loadTrackerModule(self.id);
          saveInStore = !!module;
        }

        if (!module) {
          throw new Error(`Tracker is not found ${self.id}`);
        }

        self.assign(module);
        if (saveInStore) {
          await self.save();
        }
      }).then(() => {
        self.assign({state: 'success'});
      }).catch(err => {
        debug('Loading tracker error', err);
        self.assign({state: 'error'});
      }).then(() => {
        chrome.storage.onChanged.addListener(handleTrackerChangeListener);
      });
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(handleTrackerChangeListener);
      this.destroyWorker();
    },
  };
});

export default trackerModel;