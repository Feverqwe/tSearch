import {flow, isAlive, types} from 'mobx-state-tree';
import _isEqual from "lodash.isequal";
import getLogger from "../tools/getLogger";
import storageGet from "../tools/storageGet";
import storageSet from "../tools/storageSet";
import downloadBlob from "../tools/downloadBlob";

const JSZip = require("jszip");
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
 * @property {function} getSnapshot
 * @property {function} save
 * @property {function} exportZip
 * @property {function} importZip
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
  trackerListHeight: types.optional(types.number, 200),
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
    exportZip() {
      return Promise.all([
        storageGet(null, 'local'),
        storageGet(null, 'sync'),
      ]).then(([localStorage, syncStorage]) => {
        const zip = new JSZip();

        Object.entries({
          local: localStorage,
          sync: syncStorage
        }).forEach(([type, storage]) => {
          const folder = zip.folder(type);
          Object.entries(storage).forEach(([key, value]) => {
            folder.file(key + '.json', JSON.stringify(value));
          });
        });

        return zip.generateAsync({
          type:"blob",
          compression: 'DEFLATE',
          compressionOptions: {
            level: 9
          }
        });
      }).then((blob) => {
        const nowDate = new Date();
        let date = nowDate.getDate();
        if (date < 10) {
          date = `0${date}`;
        }
        let month = nowDate.getMonth() + 1;
        if (month < 10) {
          month = `0${month}`;
        }
        const year = nowDate.getFullYear();

        downloadBlob(blob, `tms-backup-${year}-${month}-${date}.zip`);
      });
    },
    importZip() {
      return selectFile().then((file) => {
        return JSZip.loadAsync(file).then((zip) => {
          const typeStorage = {
            local: {},
            sync: {}
          };
          const promiseList = [];
          zip.forEach((path, zipEntry) => {
            if (zipEntry.dir) return;

            const m = /^(?:(.+)\/)?([^\/]+)\.json$/.exec(zipEntry.name);
            if (m) {
              const [, type = 'local', key] = m;
              if (!typeStorage[type]) {
                logger.error('Storage type is not found!', zipEntry.name);
                return;
              }

              const promise = zip.file(path).async("string").then((value) => {
                try {
                  typeStorage[type][key] = JSON.parse(value);
                } catch (err) {
                  logger.error('Read file error!', path, err);
                }
              });
              promiseList.push(promise);
            } else {
              logger.error('Math key name error!', zipEntry.name);
            }
          });
          return Promise.all(promiseList).then(() => {
            return Promise.all([
              storageSet(typeStorage.local, 'local'),
              storageSet(typeStorage.sync, 'sync'),
            ]);
          });
        }).catch((err) => {
          logger.error('Read file error', err);
          alert('Read file error! ' + err.message);
        });
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

const selectFile = () => {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      resolve(file);
    });
    input.click();
  });
};

export default OptionsStore;