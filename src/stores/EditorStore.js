import {destroy, flow, isAlive, types} from 'mobx-state-tree';
import {TrackerOptionsStore} from '../stores/TrackerStore';
import getTrackerCodeMeta from "../tools/getTrackerCodeMeta";
import getLogger from "../tools/getLogger";
import getHash from "../tools/getHash";
import TrackerStore from "./TrackerStore";

const logger = getLogger('EditorStore');

/**
 * @typedef {TrackerOptionsStore} EditorTrackerOptionsStore
 * @property {function} setAutoUpdate
 */
const EditorTrackerOptionsStore = types.compose('EditorTrackerOptionsStore', TrackerOptionsStore).actions(self => {
  return {
    setAutoUpdate(value) {
      self.autoUpdate = value;
    }
  };
});

/**
 * @typedef {{}} EditorStore
 * @property {string} id
 * @property {string} type
 * @property {string} [state]
 * @property {string} [saveState]
 * @property {EditorTrackerOptionsStore} [options]
 * @property {string|undefined|null} code
 * @property {function} setCode
 * @property {function:Promise} fetchModule
 * @property {function:Promise} save
 */
const EditorStore = types.model('EditorStore', {
  id: types.string,
  type: types.string,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  saveState: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  options: types.optional(EditorTrackerOptionsStore, {}),
  code: types.maybeNull(types.string),
  hash: types.maybeNull(types.string),
}).actions(self => {
  return {
    setCode(text) {
      self.code = text;
    },
    fetchModule: flow(function* () {
      self.state = 'pending';
      try {
        let module = null;
        if (self.type === 'tracker') {
          module = yield new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => storage.trackers[self.id]);
        } else {
          throw new Error('Type is not supported');
        }
        if (isAlive(self)) {
          if (module) {
            self.code = module.code;
            self.options = module.options;
          } else {
            // todo: default code by type
            self.code = '';
          }
          self.hash = self.getHash();
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchModule error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    save: flow(function* () {
      self.saveState = 'pending';
      try {
        if (self.type === 'tracker') {
          const trackerStore = TrackerStore.create({
            id: self.id,
            meta: getTrackerCodeMeta(self.code),
            code: self.code,
            options: self.options.toJSON(),
          });
          const tracker = trackerStore.toJSON();
          destroy(trackerStore);

          yield new Promise(resolve => chrome.storage.local.get({trackers: {}}, resolve)).then(storage => {
            storage.trackers[self.id] = tracker;
            return new Promise(resolve => chrome.storage.local.set(storage, resolve));
          });
          if (isAlive(self)) {
            self.hash = self.getHash();
          }
        } else {
          throw new Error('Type is not supported');
        }
        if (isAlive(self)) {
          self.saveState = 'done';
        }
      } catch (err) {
        logger.error('save error', err);
        if (isAlive(self)) {
          self.saveState = 'error';
        }
      }
    })
  };
}).views(self => {
  return {
    hasChanges() {
      return self.getHash() !== self.hash;
    },
    getHash() {
      return getHash(JSON.stringify([self.code, self.options]));
    }
  }
});

export default EditorStore;