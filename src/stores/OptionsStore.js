import {flow, getSnapshot, isAlive, types} from 'mobx-state-tree';
import _isEqual from "lodash.isequal";
import getLogger from "../tools/getLogger";

const promiseLimit = require('promise-limit');

const logger = getLogger('OptionsStore');
const oneLimit = promiseLimit(1);


/**
 * @typedef {{}} ExplorerSectionsStore
 * @property {boolean} [favorite]
 * @property {boolean} [kpFavorites]
 * @property {boolean} [kpInCinema]
 * @property {boolean} [imdbInCinema]
 * @property {boolean} [kpPopular]
 * @property {boolean} [imdbPopular]
 * @property {boolean} [kpSeries]
 * @property {boolean} [imdbSeries]
 * @property {boolean} [ggGamesNew]
 * @property {boolean} [ggGamesTop]
 * @property {function} setEnabled
 */
const ExplorerSectionsStore = types.model('ExplorerSectionsStore', {
  favorite: types.optional(types.boolean, true),
  kpFavorites: types.optional(types.boolean, true),
  kpInCinema: types.optional(types.boolean, true),
  imdbInCinema: types.optional(types.boolean, true),
  kpPopular: types.optional(types.boolean, true),
  imdbPopular: types.optional(types.boolean, true),
  kpSeries: types.optional(types.boolean, true),
  imdbSeries: types.optional(types.boolean, true),
  ggGamesNew: types.optional(types.boolean, true),
  ggGamesTop: types.optional(types.boolean, true),
}).actions(self => {
  return {
    setEnabled(key, value) {
      self[key] = value;
    }
  };
});


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
 * @property {ExplorerSectionsStore} [explorerSections]
 * @property {function} setEnabled
 * @property {function} setValue
 */
const OptionsValueStore = types.model('OptionsValueStore', {
  hidePeerRow: types.optional(types.boolean, false),
  hideSeedRow: types.optional(types.boolean, false),
  categoryWordFilter: types.optional(types.boolean, true),
  contextMenu: types.optional(types.boolean, true),
  disablePopup: types.optional(types.boolean, false),
  invertIcon: types.optional(types.boolean, false),
  doNotSendStatistics: types.optional(types.boolean, false),
  originalPosterName: types.optional(types.boolean, false),
  kpFolderId: types.optional(types.string, '1'),
  explorerSections: types.optional(ExplorerSectionsStore, {}),
  sorts: types.optional(types.array(types.model({
    by: types.string,
    direction: types.optional(types.number, 0),
  })), [{by: 'quality'}]),
}).actions(self => {
  return {
    setEnabled(key, value) {
      self[key] = value;
    },
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
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  options: types.maybeNull(OptionsValueStore),
}).actions(self => {
  return {
    setOptions(value) {
      self.options = value;
    },
    fetchOptions: flow(function* () {
      self.state = 'pending';
      try {
        const storage = yield new Promise(resolve => chrome.storage.sync.get({options: {}}, resolve));
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
        return new Promise(resolve => chrome.storage.sync.set({
          options: getSnapshot(self.options),
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