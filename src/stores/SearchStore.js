import {flow, getParentOfType, isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import RootStore from "./RootStore";
import TrackerStore from "./TrackerStore";
import highlight from "../tools/highlight";
import rate from "../tools/rate";
import {unixTimeToFromNow, unixTimeToString} from "../tools/unixTimeTo";
import filesize from "filesize";
import {ErrorWithCode} from "../tools/errors";
import SearchPageStore from "./SearchPageStore";

const logger = getLogger('SearchStore');

/**
 * @typedef {{}} TrackerSearchStore
 * @property {string} id
 * @property {string} [state]
 * @property {*} nextQuery
 * @property {{url:string|undefined|null}|undefined} authRequired
 * @property {function:Promise} searchWrapper
 * @property {function} search
 * @property {function} searchNext
 * @property {*} tracker
 * @property {*} query
 * @property {*} queryHighlightMap
 * @property {*} queryRateScheme
 */
const TrackerSearchStore = types.model('TrackerSearchStore', {
  id: types.string,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  nextQuery: types.frozen(),
  authRequired: types.maybe(types.model({
    url: types.maybeNull(types.string)
  })),
}).actions((self) => {
  return {
    searchWrapper: flow(function* (searchFn) {
      const {id, queryHighlightMap, queryRateScheme} = self;
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      const defineCategory = rootStore.options.options.defineCategory;
      self.state = 'pending';
      try {
        const tracker = self.tracker;
        if (!tracker) {
          throw new Error(`Tracker ${id} is not found`);
        }
        const result = yield searchFn();
        if (!result) {
          throw new ErrorWithCode(`Search error: result is empty`, 'EMPTY_RESULT');
        }
        if (!result.success) {
          if (result.error === 'AUTH') {
            // legacy
            const err = new ErrorWithCode(`Search error: auth required`, 'AUTH_REQUIRED');
            err.url = result.url;
            throw err;
          } else {
            throw new ErrorWithCode(`Search error: not success`, 'NOT_SUCCESS');
          }
        }
        if (isAlive(self)) {
          self.nextQuery = result.nextPageRequest;
          self.state = 'done';
        }
        return prepSearchResults(id, queryHighlightMap, queryRateScheme, result.results, defineCategory);
      } catch (err) {
        if (isAlive(self)) {
          self.state = 'error';
        }
        if (err.code === 'AUTH_REQUIRED') {
          if (isAlive(self)) {
            self.authRequired = {
              url: err.url
            };
          }
        } else {
          logger.error(`[${id}] searchWrapper error`, err);
        }
      }
    }),
    search() {
      return self.searchWrapper(() => {
        return self.tracker.worker.search(self.query);
      });
    },
    searchNext() {
      const {nextQuery} = self;
      if (!nextQuery) return Promise.resolve();

      return self.searchWrapper(() => {
        return self.tracker.worker.searchNext(nextQuery);
      });
    },
  };
}).views((self) => {
  return {
    get tracker() {
      return resolveIdentifier(TrackerStore, self, self.id);
    },
    get query() {
      return getParentOfType(self, SearchStore).query;
    },
    get queryHighlightMap() {
      return getParentOfType(self, SearchStore).queryHighlightMap;
    },
    get queryRateScheme() {
      return getParentOfType(self, SearchStore).queryRateScheme;
    },
  };
});

/**
 * @typedef {{}} SearchStore
 * @property {number} id
 * @property {string} [state]
 * @property {string} query
 * @property {Map<*,TrackerSearchStore>} trackerSearch
 * @property {SearchPageStore[]} pages
 * @property {number} [categoryId]
 * @property {function:Promise} searchWrapper
 * @property {function} search
 * @property {function} searchNext
 * @property {function} createTrackerSearch
 * @property {function} setCategoryId
 * @property {*} queryHighlightMap
 * @property {*} queryRateScheme
 * @property {function} getResultCountByTrackerId
 * @property {function} getVisibleResultCountByTrackerId
 * @property {*} hasNextQuery
 */
const SearchStore = types.model('SearchStore', {
  id: types.identifierNumber,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  query: types.string,
  trackerSearch: types.map(TrackerSearchStore),
  pages: types.array(SearchPageStore),
  categoryId: types.maybe(types.number),
}).actions(self => {
  return {
    searchWrapper: flow(function* (serachFn) {
      self.state = 'pending';
      try {
        const /**RootStore*/rootStore = getParentOfType(self, RootStore);

        const page = SearchPageStore.create({
          sorts: JSON.parse(JSON.stringify(rootStore.options.options.sorts)),
          categoryId: self.categoryId && JSON.parse(JSON.stringify(self.categoryId)),
        });
        self.pages.push(page);

        yield Promise.all(rootStore.profiles.prepSelectedTrackerIds.map(trackerId => {
          const trackerSearch = self.createTrackerSearch(trackerId);
          return serachFn(trackerSearch).then((results) => {
            if (isAlive(self)) {
              if (results) {
                page.appendResults(trackerId, results);
              }
            }
          });
        }));

        if (isAlive(self)) {
          self.state = 'done';
        }
      } catch (err) {
        logger.error('searchWrapper error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    search() {
      return self.searchWrapper((trackerSearch) => {
        return trackerSearch.search();
      });
    },
    searchNext() {
      return self.searchWrapper((trackerSearch) => {
        return trackerSearch.searchNext();
      });
    },
    createTrackerSearch(trackerId) {
      let nextQuery = undefined;
      const prevTrackerSearch = self.trackerSearch.get(trackerId);
      if (prevTrackerSearch && prevTrackerSearch.state === 'done') {
        nextQuery =  prevTrackerSearch.nextQuery;
      }
      const trackerSearch = TrackerSearchStore.create({
        id: trackerId,
        nextQuery: nextQuery
      });
      self.trackerSearch.set(trackerId, trackerSearch);
      return trackerSearch;
    },
    setCategoryId(value) {
      self.categoryId = value;
    }
  };
}).views(self => {
  let queryHighlightMapCache = null;
  let queryRateScheme = null;
  return {
    get queryHighlightMap() {
      if (queryHighlightMapCache === null) {
        queryHighlightMapCache = highlight.getMap(self.query);
      }
      return queryHighlightMapCache;
    },
    get queryRateScheme() {
      if (queryRateScheme === null) {
        queryRateScheme = rate.getScheme(self.query);
      }
      return queryRateScheme;
    },
    getResultCountByTrackerId(id) {
      return self.pages.reduce((count, page) => {
        count += page.getResultCountByTrackerId(id);
        return count;
      }, 0);
    },
    getVisibleResultCountByTrackerId(id) {
      return self.pages.reduce((count, page) => {
        count += page.getVisibleResultCountByTrackerId(id);
        return count;
      }, 0);
    },
    get hasNextQuery() {
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      const prepSelectedTrackerIds = rootStore.profiles.prepSelectedTrackerIds;
      for (let trackerSearch of self.trackerSearch.values()) {
        if (trackerSearch.nextQuery) {
          if (prepSelectedTrackerIds.indexOf(trackerSearch.id) !== -1) {
            return true;
          }
        }
      }
    }
  };
});

const prepSearchResults = (trackerId, queryHighlightMap, queryRateScheme, results, defineCategory) => {
  return results.filter(result => {
    if (!result.url) {
      logger.warn(`[${trackerId}] Skip torrent, cause no url`, result);
      return false;
    } else
    if (!result.title) {
      logger.warn(`[${trackerId}] Skip torrent cause no title`, result);
      return false;
    } else {
      ['size', 'seeds', 'peers', 'date', 'categoryId'].forEach(key => {
        let value = result[key];
        if (['undefined', 'number'].indexOf(typeof value) === -1) {
          value = parseInt(value, 10);
          if (!Number.isFinite(value)) {
            value = undefined;
          }
          result[key] = value;
        }
      });
      result.trackerId = trackerId;
      result.titleHighlightMap = highlight.getTextMap(result.title, queryHighlightMap);
      const itemRate = rate.getRate(result, queryRateScheme);
      result.rate = itemRate;
      result.quality = itemRate.sum;
      result.dateTitle = unixTimeToString(result.date);
      result.dateText = unixTimeToFromNow(result.date);
      try {
        result.sizeText = filesize(result.size);
      } catch (err) {
        result.sizeText = 'n/a';
      }
      result.titleLowerCase = result.title.toLowerCase();
      result.categoryTitleLowerCase = (result.categoryTitle || '').toLowerCase();

      if (result.categoryId === undefined) {
        result.categoryId = -1;
      }
      if (defineCategory && result.categoryId === -1) {
        result.categoryId = rate.categoryDefine(itemRate, result.categoryTitleLowerCase);
      }
      return true;
    }
  });
};

export default SearchStore;