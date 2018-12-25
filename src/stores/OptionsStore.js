import {flow, getSnapshot, isAlive, types} from 'mobx-state-tree';
import _isEqual from "lodash.isequal";
import getLogger from "../tools/getLogger";
import storageGet from "../tools/storageGet";
import storageSet from "../tools/storageSet";

const promiseLimit = require('promise-limit');

const logger = getLogger('OptionsStore');
const oneLimit = promiseLimit(1);


/**
 * @typedef {{}} ExplorerSectionsStore
 * @property {boolean} [favorites]
 * @property {boolean} [kpFavorites]
 * @property {boolean} [kpInCinema]
 * @property {boolean} [imdbInCinema]
 * @property {boolean} [kpPopular]
 * @property {boolean} [imdbPopular]
 * @property {boolean} [kpSeries]
 * @property {boolean} [imdbSeries]
 * @property {boolean} [ggGamesNew]
 * @property {boolean} [ggGamesTop]
 * @property {function} setValue
 */
const ExplorerSectionsStore = types.model('ExplorerSectionsStore', {
  favorites: types.optional(types.boolean, true),
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
    setValue(key, value) {
      self[key] = value;
    }
  };
});


/**
 * @typedef {{}} OptionsStore
 * @property {string} [state]
 * @property {boolean} [hidePeerRow]
 * @property {boolean} [hideSeedRow]
 * @property {boolean} [categoryWordFilter]
 * @property {boolean} [contextMenu]
 * @property {boolean} [disablePopup]
 * @property {boolean} [invertIcon]
 * @property {boolean} [doNotSendStatistics]
 * @property {boolean} [originalPosterName]
 * @property {string} [kpFolderId]
 * @property {ExplorerSectionsStore} [explorerSections]
 * @property {{by:string,[direction]:number}[]} [sorts]
 * @property {number} [trackerListHeight]
 * @property {function} setValue
 * @property {function} setOptions
 * @property {function:Promise} fetchOptions
 * @property {function} save
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const OptionsStore = types.model('OptionsStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
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
  trackerListHeight: types.optional(types.number, 0),
}).actions(self => {
  return {
    setValue(key, value) {
      self[key] = value;
    },
    setOptions(value) {
      Object.assign(self, value);
    },
    fetchOptions: flow(function* () {
      self.state = 'pending';
      try {
        const storage = yield storageGet({options: {}}, 'sync');
        if (isAlive(self)) {
          self.setOptions(storage.options);
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
        if (!_isEqual(options, self.getSnapshot())) {
          self.setOptions(options);
        }
      }
    }
  };

  return {
    getSnapshot() {
      const {state, ...options} = self;
      return JSON.parse(JSON.stringify(options));
    },
    save() {
      return oneLimit(() => {
        return storageSet({
          options: self.getSnapshot(),
        }, 'sync');
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