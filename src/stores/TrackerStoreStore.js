import {destroy, flow, getRoot, isAlive, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import {fetch} from "whatwg-fetch";
import {struct} from 'superstruct';
import TrackerStore, {TrackerMetaStore} from "./TrackerStore";
import getTrackerCodeMeta from "../tools/getTrackerCodeMeta";
import storageGet from "../tools/storageGet";
import storageSet from "../tools/storageSet";
import getHash from "../tools/getHash";
import setCodeMeta from "../tools/setCodeMeta";

const logger = getLogger('TrackerStoreStore');

const Files = struct([struct.partial({
  name: 'string',
  // path: 'string',
  // sha: 'string',
  size: 'number',
  // url: 'string',
  html_url: 'string',
  // git_url: 'string',
  download_url: 'string',
  type: 'string',
  // _links: struct.partial({
  //   self: 'string',
  //   git: 'string',
  //   html: 'string',
  // }),
})]);

/**
 * @typedef {{}} TrackerStoreResultStore
 * @property {string} [state]
 * @property {string|undefined} id
 * @property {string} name
 * @property {number} size
 * @property {string} fileType
 * @property {string} html_url
 * @property {string} download_url
 * @property {TrackerMetaStore|undefined} meta
 * @property {string|undefined} code
 * @property {function:Promise} fetch
 * @property {function} save
 * @property {*} tracker
 * @property {*} hasTracker
 * @property {function} deleteTacker
 */
const TrackerStoreResultStore = types.model('TrackerStoreResultStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  name: types.string,
  size: types.number,
  fileType: types.enumeration(['js', 'json']),
  html_url: types.string,
  download_url: types.string,
  meta: types.maybe(TrackerMetaStore),
  code: types.maybe(types.string),
}).actions((self) => {
  return {
    fetch: flow(function* () {
      if (self.state === 'pending') return;
      const {download_url: url, html_url, fileType} = self;
      self.state = 'pending';
      try {
        let code = yield fetch(url).then(async (response) => {
          if (!response.ok) {
            throw new Error('Response is not ok');
          }

          const text = await response.text();
          if (fileType === 'json') {
            const jsonCodeToUserscript = (await import("../tools/jsonCodeToUserscript")).default;
            return jsonCodeToUserscript(text);
          } else {
            return text;
          }
        });
        let meta = getTrackerCodeMeta(code);
        if (!meta.downloadURL) {
          meta.downloadURL = url;
          code = setCodeMeta(code, meta);
        }
        if (isAlive(self)) {
          self.meta = meta;
          self.code = code;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetch code error', url, err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    save() {
      const {id} = self;
      const trackerStore = TrackerStore.create({
        id: id,
        meta: getTrackerCodeMeta(self.code),
        code: self.code,
      });
      const tracker = trackerStore.toJSON();
      destroy(trackerStore);

      storageGet({trackers: {}}).then(storage => {
        storage.trackers[id] = tracker;
        return storageSet(storage);
      });
    }
  };
}).views((self) => {
  return {
    get id() {
      return getHash(self.download_url);
    },
    get tracker() {
      /**@type RootStore*/
      const rootStore = getRoot(self);
      let tracker = rootStore.trackers.getTrackerById(self.id);
      if (!tracker) {
        tracker = rootStore.trackers.getTrackerByDownloadUrl(self.download_url);
      }
      return tracker;
    },
    get hasTracker() {
      return !!self.tracker;
    },
    deleteTacker() {
      /**@type RootStore*/
      const rootStore = getRoot(self);
      if (self.tracker) {
        rootStore.trackers.deleteTracker(self.tracker.id);
        rootStore.trackers.saveTrackers();
      }
    }
  };
});

/**
 * @typedef {{}} TrackerStoreStore
 * @property {string} [state]
 * @property {TrackerStoreResultStore[]} results
 * @property {function:Promise} fetch
 * @property {function} putResults
 */
const TrackerStoreStore = types.model('TrackerStoreStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  results: types.array(TrackerStoreResultStore),
}).actions(/**ProfilesStore*/(self) => {
  return {
    fetch: flow(function* () {
      if (self.state === 'pending') return;
      self.state = 'pending';
      self.results = [];
      try {
        /**@type RootStore*/
        const rootStore = getRoot(self);
        yield Promise.all(rootStore.options.options.repositories.map((url) => {
          return fetch(url).then((response) => {
            if (!response.ok) {
              throw new Error('Response is not ok');
            }
            return response.json();
          }).then((data) => {
            const files = Files(data);
            const results = files.filter((file) => {
              if (file.type === 'file') {
                if (/\.(js)$/i.test(file.name)) {
                  file.fileType = 'js';
                  return true;
                } else
                if (/\.(json)$/i.test(file.name)) {
                  file.fileType = 'json';
                  return true;
                }
              }
              return false;
            });
            if (isAlive(self)) {
              self.putResults(results);
            }
          }).catch((err) => {
            logger.error('fetch repo error', url, err);
          });
        }));
        if (isAlive(self)) {
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetch error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    putResults(results) {
      self.results.push(...results);
    }
  };
}).views(/**ProfilesStore*/(self) => {
  return {
  };
});

export default TrackerStoreStore;