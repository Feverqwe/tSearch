import {types, getSnapshot} from "mobx-state-tree";
import promisifyApi from "../tools/promisifyApi";

const debug = require('debug')('historyModel');
const promiseLimit = require('promise-limit');

const oneLimit = promiseLimit(1);

/**
 * @typedef {{}} HistoryM
 * Model:
 * @property {string} state
 * @property {Map<string,QueryM>} searchHistory
 * Actions:
 * @property {function(string)} setQuery
 * @property {function(string,string,string,string)} setClick
 * Views:
 */

/**
 * @typedef {{}} ClickM
 * Model:
 * @property {string} url
 * @property {string} title
 * @property {string} trackerId
 * @property {number} time
 * Actions:
 * Views:
 */

const clickModel = types.model('click', {
  url: types.identifier(),
  title: types.string,
  trackerId: types.string,
  time: types.number,
});

/**
 * @typedef {{}} QueryM
 * Model:
 * @property {string} query
 * @property {number} count
 * @property {number} time
 * @property {Map<string,ClickM>} clicks
 * Actions:
 * Views:
 */

const queryModel = types.model('query', {
  query: types.identifier(),
  count: types.optional(types.number, 0),
  time: types.optional(types.number, 0),
  clicks: types.optional(types.map(clickModel), {})
}).actions(self => {
  return {
    setClick(query, title, url, trackerId) {
      self.clicks.set(url, {
        url: url,
        title: title,
        trackerId: trackerId,
        time: Math.trunc(Date.now() / 1000)
      });
    },
  };
});

const historyModel = types.model('historyModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, done
  history: types.optional(types.map(queryModel), {}),
}).actions(self => {
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
  };
}).views(self => {
  let readyPromise = null;
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
        return promisifyApi('chrome.storage.local.set')({
          history: getSnapshot(self.history)
        });
      });
    },
    getHistory() {
      return Array.from(self.history.values());
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
      return readyPromise = promisifyApi('chrome.storage.local.get')({
        history: {}
      }).then(storage => {
        self.assign(storage);
      }).catch(err => {
        debug('afterCreate error', err);
      }).then(() => {
        self.assign({state: 'done'});
      });
    }
  };
});

export default historyModel;