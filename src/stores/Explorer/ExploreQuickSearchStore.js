import {flow, getSnapshot, isAlive, types} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import storageGet from "../../tools/storageGet";
import _isEqual from "lodash.isequal";
import storageSet from "../../tools/storageSet";

const promiseLimit = require('promise-limit');

const logger = getLogger('ExploreQuickSearchStore');
const oneLimit = promiseLimit(1);

/**
 * @typedef {{}} ExploreQuickSearchResultStore
 * @property {string} url
 * @property {string} title
 */

const ExploreQuickSearchResultStore = types.model('ExploreQuickSearchResultStore', {
  url: types.string,
  title: types.string,
});

/**
 * @typedef {{}} ExploreQuickSearchItemStore
 * @property {string} query
 * @property {string} label
 * @property {number} [time]
 * @property {ExploreQuickSearchResultStore[]} results
 */
const ExploreQuickSearchItemStore = types.model('ExploreQuickSearchItemStore', {
  query: types.identifier,
  label: types.string,
  time: types.optional(types.number, 0),
  results: types.array(ExploreQuickSearchResultStore),
});

/**
 * @typedef {{}} ExploreQuickSearchStore
 * @property {string} [state]
 * @property {Map<*,ExploreQuickSearchItemStore>} quickSearch
 * @property {function} setQuickSearch
 * @property {function:Promise} fetch
 * @property {function} addItem
 * @property {function} removeItem
 * @property {function} save
 * @property {function} getItem
 * @property {function} getQuickSearch
 * @property {function} getQuickSearchSortByTime
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const ExploreQuickSearchStore = types.model('ExploreQuickSearchStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  quickSearch: types.map(ExploreQuickSearchItemStore),
}).actions((self) => {
  return {
    setQuickSearch(value) {
      self.quickSearch = value;
    },
    fetch: flow(function* () {
      self.state = 'pending';
      try {
        const storage = yield storageGet({quickSearch: {}});
        if (isAlive(self)) {
          self.quickSearch = storage.quickSearch;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetch error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    addItem(item) {
      self.quickSearch.put(item);

      if (self.quickSearch.size > 100) {
        self.getQuickSearchSortByTime().slice(100).forEach((query) => {
          self.removeItem(query.query);
        });
      }

      self.save();
    },
    removeItem(query) {
      self.quickSearch.delete(query);
    }
  };
}).views((self) => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'local') {
      const change = changes.quickSearch;
      if (change) {
        const quickSearch = change.newValue;
        if (!_isEqual(quickSearch, getSnapshot(self.quickSearch))) {
          self.setQuickSearch(quickSearch);
        }
      }
    }
  };

  return {
    save() {
      return oneLimit(() => {
        return storageSet({
          quickSearch: getSnapshot(self.quickSearch)
        });
      });
    },
    getItem(query) {
      return self.quickSearch.get(query);
    },
    getQuickSearch() {
      return Array.from(self.quickSearch.values());
    },
    getQuickSearchSortByTime() {
      return self.getQuickSearch().sort(({time: a}, {time: b}) => {
        return a === b ? 0 : a > b ? -1 : 1;
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

export default ExploreQuickSearchStore;