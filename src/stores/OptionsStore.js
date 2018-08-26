import {flow, getSnapshot, isAlive, types} from 'mobx-state-tree';
import _isEqual from "lodash.isequal";
import getLogger from "../tools/getLogger";

const promiseLimit = require('promise-limit');

const logger = getLogger('OptionsStore');
const oneLimit = promiseLimit(1);


/**
 * @typedef {{}} OptionsValueStore
 * @property {boolean} [hidePeerRow]
 * @property {boolean} [hideSeedRow]
 * @property {boolean} [categoryWordFilter]
 * @property {boolean} [syncProfiles]
 * @property {boolean} [contextMenu]
 * @property {boolean} [disablePopup]
 * @property {boolean} [invertIcon]
 * @property {boolean} [doNotSendStatistics]
 * @property {boolean} [originalPosterName]
 * @property {boolean} [favoriteSync]
 * @property {string} [kpFolderId]
 * @property {function} setValue
 */
const OptionsValueStore = types.model('OptionsValueStore', {
  hidePeerRow: types.optional(types.boolean, false),
  hideSeedRow: types.optional(types.boolean, false),
  categoryWordFilter: types.optional(types.boolean, false),
  syncProfiles: types.optional(types.boolean, true),
  contextMenu: types.optional(types.boolean, true),
  disablePopup: types.optional(types.boolean, false),
  invertIcon: types.optional(types.boolean, true),
  doNotSendStatistics: types.optional(types.boolean, false),
  originalPosterName: types.optional(types.boolean, false),
  favoriteSync: types.optional(types.boolean, true),
  kpFolderId: types.optional(types.string, '1'),
}).actions(self => {
  return {
    setValue(key, value) {
      self[key] = value;
    }
  };
});


/**
 * @typedef {{}} OptionsStore
 * @property {string} [state]
 * @property {OptionsValueStore|undefined|null} options
 * @property {function} setOptions
 * @property {function:Promise} fetchOptions
 * @property {function} save
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const OptionsStore = types.model('OptionsStore', {
  state: types.optional(types.enumeration('State', ['idle', 'pending', 'done', 'error']), 'idle'),
  options: types.maybeNull(OptionsValueStore),
}).actions(self => {
  return {
    setOptions(value) {
      this.options = value;
    },
    fetchOptions: flow(function* () {
      self.state = 'pending';
      try {
        const storage = yield new Promise(resolve => chrome.storage.local.get({options: {}}, resolve));
        if (isAlive(self)) {
          self.options = storage.options;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchOptions error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    })
  };
}).views(self => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'sync') {
      const change = changes.options;
      if (change) {
        const options = change.newValue;
        if (!_isEqual(options, getSnapshot(self.options))) {
          self.setOptions(options);
        }
      }
    }
  };

  return {
    save() {
      return oneLimit(() => {
        return new Promise(resolve => chrome.storage.local.set({
          options: getSnapshot(self.options)
        }, resolve));
      });
    },
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

export default OptionsStore;