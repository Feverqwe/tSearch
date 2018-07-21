import {types, getSnapshot} from "mobx-state-tree";
import highlight from "../tools/highlight";
import _isEqual from "lodash.isequal";
import getLogger from "../tools/getLogger";

const promiseLimit = require('promise-limit');

const debug = getLogger('historyModel');
const oneLimit = promiseLimit(1);

/**
 * @typedef {{}} ClickM
 * Model:
 * @property {string} url
 * @property {string} title
 * @property {string} trackerId
 * @property {number} time
 * Actions:
 * Views:
 * @property {function(RegExp):Array} getTitleHighlightMap
 */

const clickModel = types.model('click', {
  url: types.identifier(),
  title: types.string,
  trackerId: types.string,
  time: types.number,
}).views(self => {
  return {
    getTitleHighlightMap(queryHighlightMap) {
      return highlight.getTextMap(self.title, queryHighlightMap);
    }
  };
});


/**
 * @typedef {{}} QueryM
 * Model:
 * @property {string} query
 * @property {number} count
 * @property {number} time
 * @property {Map<string,ClickM>} clicks
 * Actions:
 * @property {function(string,string,string,string)} setClick
 * @property {function(string)} removeClick
 * Views:
 * @property {function:ClickM[]} getClicks
 * @property {function:ClickM[]} getClicksSortByTime
 * @property {function:RegExp} getQueryHighlightMap
 */

const queryModel = types.model('query', {
  query: types.identifier(),
  count: types.optional(types.number, 0),
  time: types.optional(types.number, 0),
  clicks: types.optional(types.map(clickModel), {})
}).actions(/**QueryM*/self => {
  return {
    setClick(query, title, url, trackerId) {
      self.clicks.set(url, {
        url: url,
        title: title,
        trackerId: trackerId,
        time: Math.trunc(Date.now() / 1000)
      });
    },
    removeClick(url) {
      self.clicks.delete(url);
    }
  };
}).views(/**QueryM*/self => {
  return {
    getClicks() {
      return Array.from(self.clicks.values());
    },
    getClicksSortByTime() {
      return self.getClicks().sort(({time: a}, {time: b}) => {
        return a === b ? 0 : a > b ? -1 : 1;
      });
    },
    getQueryHighlightMap() {
      return highlight.getMap(self.query);
    },
  };
});


/**
 * @typedef {{}} HistoryM
 * Model:
 * @property {string} state
 * @property {Map<string,QueryM>} history
 * Actions:
 * @property {function(Object)} assign
 * @property {function(string)} setQuery
 * @property {function(string,string,string,string)} setClick
 * @property {function(string)} removeQuery
 * Views:
 * @property {Promise} readyPromise
 * @property {function(string):QueryM} getOrCreateQuery
 * @property {function:Promise} save
 * @property {function:QueryM[]} getHistory
 * @property {function:QueryM[]} getHistorySortByTime
 * @property {function(string):Promise} onQuery
 * @property {function(string, string, string, string):Promise} onClick
 */

const historyModel = types.model('historyModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, done
  history: types.optional(types.map(queryModel), {}),
}).actions(/**HistoryM*/self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
    setQuery(query) {
      const q = self.getOrCreateQuery(query);
      q.count++;
      q.time = Math.trunc(Date.now() / 1000);

      self.save();
    },
    setClick(query, title, url, trackerId) {
      const q = self.getOrCreateQuery(query);
      q.setClick(query, title, url, trackerId);

      self.save();
    },
    removeQuery(query) {
      self.history.delete(query);
    },
  };
}).views(/**HistoryM*/self => {
  let readyPromise = null;

  const handleHistoryChangeListener = (changes, namespace) => {
    if (namespace === 'local') {
      const change = changes.history;
      if (change) {
        const history = change.newValue;
        if (!_isEqual(history, getSnapshot(self.history))) {
          self.assign({history});
        }
      }
    }
  };

  return {
    get readyPromise() {
      return readyPromise;
    },
    getOrCreateQuery(query) {
      let q = self.history.get(query);
      if (!q) {
        q = self.history.put({
          query: query
        });
      }
      return q;
    },
    save() {
      return oneLimit(() => {
        return new Promise(resolve => chrome.storage.local.set({
          history: getSnapshot(self.history)
        }, resolve));
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
    onQuery(query) {
      return self.readyPromise.then(() => {
        self.setQuery(query);
      });
    },
    onClick(query, title, url, trackerId) {
      return self.readyPromise.then(() => {
        self.setClick(query, title, url, trackerId);
      });
    },
    afterCreate() {
      self.assign({state: 'loading'});
      return readyPromise = new Promise(resolve => chrome.storage.local.get({
        history: {}
      }, resolve)).then(storage => {
        chrome.storage.onChanged.addListener(handleHistoryChangeListener);
        self.assign({
          state: 'done',
          history: storage.history,
        });
      });
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(handleHistoryChangeListener);
    }
  };
}).create();

export default historyModel;