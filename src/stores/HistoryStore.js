import {applyPatch, flow, getParentOfType, isAlive, types} from 'mobx-state-tree';
import highlight from "../tools/highlight";
import getLogger from "../tools/getLogger";
import getNow from "../tools/getNow";
import {unixTimeToString} from "../tools/unixTimeTo";
import storageGet from "../tools/storageGet";
import storageSet from "../tools/storageSet";
import mobxCompare from "../tools/mobxCompare";
import checkChangeId from "../tools/checkChangeId";

const promiseLimit = require('promise-limit');

const logger = getLogger('HistoryStore');
const oneLimit = promiseLimit(1);


/**
 * @typedef {{}} HistoryClickStore
 * @property {string} url
 * @property {string} title
 * @property {string} trackerId
 * @property {number} time
 * @property {*} titleHighlightMap
 * @property {*} timeString
 */
const HistoryClickStore = types.model('HistoryClickStore', {
  url: types.string,
  title: types.string,
  trackerId: types.string,
  time: types.number,
}).views(self => {
  return {
    get titleHighlightMap() {
      const query = getParentOfType(self, HistoryQueryStore);
      return highlight.getTextMap(self.title, query.queryHighlightMap);
    },
    get timeString() {
      return unixTimeToString(self.time);
    }
  };
});


/**
 * @typedef {{}} HistoryQueryStore
 * @property {string} query
 * @property {number} [count]
 * @property {number} [time]
 * @property {Map<*,HistoryClickStore>} clicks
 * @property {function} setClick
 * @property {function} removeClick
 * @property {function} getClicks
 * @property {function} getClicksSortByTime
 * @property {*} queryHighlightMap
 */
const HistoryQueryStore = types.model('HistoryQueryStore', {
  query: types.identifier,
  count: types.optional(types.number, 0),
  time: types.optional(types.number, 0),
  clicks: types.map(HistoryClickStore),
}).actions(self => {
  return {
    setClick(query, title, url, trackerId) {
      self.clicks.set(url, {
        url: url,
        title: title,
        trackerId: trackerId,
        time: getNow()
      });
      if (self.clicks.size > 150) {
        self.getClicksSortByTime().slice(100).forEach((click) => {
          self.removeClick(click.url);
        });
      }
    },
    removeClick(url) {
      self.clicks.delete(url);
    }
  };
}).views(self => {
  return {
    getClicks() {
      return Array.from(self.clicks.values());
    },
    getClicksSortByTime() {
      return self.getClicks().sort(({time: a}, {time: b}) => {
        return a === b ? 0 : a > b ? -1 : 1;
      });
    },
    get queryHighlightMap() {
      return highlight.getMap(self.query);
    },
  };
});


/**
 * @typedef {{}} HistoryStore
 * @property {string} [state]
 * @property {Map<*,HistoryQueryStore>|undefined} history
 * @property {function} setHistory
 * @property {function} addQuery
 * @property {function} addClick
 * @property {function} removeQuery
 * @property {function:Promise} fetchHistory
 * @property {function} getOrCreateQuery
 * @property {function} patchHistory
 * @property {function} save
 * @property {function} getHistory
 * @property {function} getHistorySortByTime
 * @property {function} getHistorySortByCount
 * @property {function} getHistorySnapshot
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const HistoryStore = types.model('HistoryStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  history: types.maybe(types.map(HistoryQueryStore)),
}).actions(self => {
  return {
    setHistory(value) {
      self.history = value;
    },
    addQuery(query) {
      const q = self.getOrCreateQuery(query);
      q.count++;
      q.time = getNow();

      self.save();
    },
    addClick(query, title, url, trackerId) {
      const q = self.getOrCreateQuery(query);
      q.setClick(query, title, url, trackerId);

      self.save();
    },
    removeQuery(query) {
      self.history.delete(query);
    },
    fetchHistory: flow(function* () {
      self.state = 'pending';
      try {
        const storage = yield storageGet({history: {}});
        if (isAlive(self)) {
          try {
            self.history = storage.history;
          } catch (err) {
            logger.error('fetchHistory error, history will cleared', err);
            self.history = {};
          }
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchHistory error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    getOrCreateQuery(query) {
      let q = self.history.get(query);
      if (!q) {
        q = self.history.put({
          query: query
        });
        if (self.history.size > 150) {
          self.getHistorySortByTime().slice(100).forEach((query) => {
            self.removeQuery(query.query);
          });
        }
      }
      return q;
    },
    patchHistory(diff) {
      diff.forEach((patch) => {
        // mobx-state-tree bug with path
        if (/^\/\//.test(patch.path)) {
          patch.path = patch.path.substr(1);
          applyPatch(self.history.get(''), patch);
        } else {
          applyPatch(self.history, patch);
        }
      });
    },
  };
}).views(self => {
  const storeId = Math.random() * 1000;

  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'local') {
      if (checkChangeId('history', storeId, changes)) {
        const change = changes.history;
        if (change) {
          const newValue = change.newValue || {};
          const diff = mobxCompare(self.history, newValue);
          self.patchHistory(diff);
        }
      }
    }
  };

  return {
    save() {
      return oneLimit(() => {
        return storageSet({
          history: self.getHistorySnapshot(),
          historyChangeId: `${storeId}_${Date.now()}`,
        });
      });
    },
    getHistory() {
      return Array.from(self.history.values());
    },
    getHistorySortByTime() {
      return self.getHistory().sort(({time: a}, {time: b}) => {
        return a === b ? 0 : a > b ? -1 : 1;
      });
    },
    getHistorySortByCount() {
      return self.getHistory().sort(({count: a}, {count: b}) => {
        return a === b ? 0 : a < b ? 1 : -1;
      });
    },
    getHistorySnapshot() {
      return self.history.toJSON();
    },
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

export default HistoryStore;