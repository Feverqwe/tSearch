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
 * @typedef {{}} TrackerSessionStore
 * @property {string} id
 * @property {string} [state]
 * @property {*} nextQuery
 * @property {{url:string|undefined|null}|undefined} authRequired
 * @property {function:Promise} fetchResult
 * @property {function:Promise} fetchNextResult
 * @property {function} setAuthRequired
 * @property {*} tracker
 * @property {*} search
 */
const TrackerSessionStore = types.model('TrackerSessionStore', {
  id: types.identifier,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  nextQuery: types.frozen(),
  authRequired: types.maybe(types.model({
    url: types.maybeNull(types.string)
  })),
}).actions(self => {
  return {
    fetchResult: flow(function* () {
      if (self.state === 'pending') return;
      const id = self.id;
      self.state = 'pending';
      self.nextQuery = undefined;
      self.authRequired = undefined;
      try {
        const searchStore = getParentOfType(self, SearchStore);
        const queryHighlightMap = highlight.getMap(searchStore.query);
        const queryRateScheme = rate.getScheme(searchStore.query);
        const result = yield self.tracker.worker.search(searchStore.query);
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

          return prepSearchResults(self.id, queryHighlightMap, queryRateScheme, result.results);
        } else {
          return [];
        }
      } catch (err) {
        if (err.code === 'AUTH_REQUIRED') {
          if (isAlive(self)) {
            self.setAuthRequired(err.url);
          }
        } else {
          logger.error(`[${id}] fetchResult error`, err);
        }
        if (isAlive(self)) {
          self.state = 'error';
        }
        return [];
      }
    }),
    fetchNextResult: flow(function* () {
      if (self.state === 'pending') return;
      const id = self.id;
      self.state = 'pending';
      try {
        const searchStore = getParentOfType(self, SearchStore);
        const queryHighlightMap = highlight.getMap(searchStore.query);
        const queryRateScheme = rate.getScheme(searchStore.query);
        let result = null;
        if (self.nextQuery) {
          result = yield self.tracker.worker.searchNext(self.nextQuery);
        } else {
          result = {success: true, results: []};
        }
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

          return prepSearchResults(self.id, queryHighlightMap, queryRateScheme, result.results);
        } else {
          return [];
        }
      } catch (err) {
        if (err.code === 'AUTH_REQUIRED') {
          if (isAlive(self)) {
            self.setAuthRequired(err.url);
          }
        } else {
          logger.error(`[${id}] fetchResult error`, err);
        }
        if (isAlive(self)) {
          self.state = 'error';
        }
        return [];
      }
    }),
    setAuthRequired(url) {
      self.authRequired = {url};
    },
  };
}).views(self => {
  return {
    get tracker() {
      return resolveIdentifier(TrackerStore, self, self.id);
    },
    get search() {
      return getParentOfType(self, SearchStore);
    }
  };
});

/**
 * @typedef {{}} SearchStore
 * @property {string} [state]
 * @property {string} query
 * @property {Map<*,TrackerSessionStore>} trackerSessions
 * @property {SearchPageStore[]} resultPages
 * @property {function:Promise} fetchResults
 * @property {function:Promise} fetchNextResults
 * @property {function} getTrackerSessions
 * @property {function} getResultCountByTrackerId
 * @property {function} getVisibleResultCountByTrackerId
 * @property {function} getNextQuery
 */
const SearchStore = types.model('SearchStore', {
  id: types.identifierNumber,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  query: types.string,
  trackerSessions: types.map(TrackerSessionStore),
  resultPages: types.array(SearchPageStore),
}).actions(self => {
  return {
    fetchResults: flow(function* () {
      if (self.state === 'pending') return;
      self.state = 'pending';
      self.resultPages.splice(0);

      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      const searchPage = SearchPageStore.create({
        state: 'pending',
        sorts: JSON.parse(JSON.stringify(rootStore.options.sorts)),
      });

      try {
        self.resultPages.push(searchPage);
        yield Promise.all(self.getTrackerSessions().map(trackerSession => {
          return trackerSession.fetchResult().then(results => {
            if (isAlive(searchPage)) {
              searchPage.appendResults(results);
            }
          });
        }));
        if (isAlive(self)) {
          searchPage.setState('done');
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchResults error', err);
        if (isAlive(self)) {
          searchPage.setState('error');
          self.state = 'error';
        }
      }
    }),
    fetchNextResults: flow(function* () {
      if (self.state === 'pending') return;
      self.state = 'pending';

      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      const searchPage = SearchPageStore.create({
        state: 'pending',
        sorts: JSON.parse(JSON.stringify(rootStore.options.sorts)),
      });

      try {
        self.resultPages.push(searchPage);
        yield Promise.all(self.getTrackerSessions().map(trackerSession => {
          return trackerSession.fetchNextResult().then(results => {
            if (isAlive(searchPage)) {
              searchPage.appendResults(results);
            }
          });
        }));
        if (isAlive(self)) {
          searchPage.setState('done');
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchResults error', err);
        if (isAlive(self)) {
          searchPage.setState('error');
          self.state = 'error';
        }
      }
    }),
    getTrackerSessions() {
      const result = [];
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      rootStore.profiles.selectedTrackers.forEach(profileTracker => {
        const /**TrackerStore*/tracker = profileTracker.tracker;
        if (tracker) {
          if (!self.trackerSessions.has(tracker.id)) {
            self.trackerSessions.set(tracker.id, {id: tracker.id});
          }
          const session = self.trackerSessions.get(tracker.id);
          result.push(session);
        }
      });
      return result;
    }
  };
}).views(self => {
  return {
    getResultCountByTrackerId(id) {
      return self.resultPages.reduce((count, page) => {
        count += page.getResultCountByTrackerId(id);
        return count;
      }, 0);
    },
    getVisibleResultCountByTrackerId(id) {
      return self.resultPages.reduce((count, page) => {
        count += page.getVisibleResultCountByTrackerId(id);
        return count;
      }, 0);
    },
    getNextQuery() {
      let result = null;
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      self.trackerSessions.forEach(trackerSession => {
        if (trackerSession.nextQuery) {
          if (rootStore.profiles.prepSelectedTrackerIds.indexOf(trackerSession.id) !== -1) {
            result = {state: trackerSession.state};
          }
        }
      });
      return result;
    }
  };
});

const prepSearchResults = (trackerId, queryHighlightMap, queryRateScheme, results) => {
  return results.filter(result => {
    if (!result.url) {
      logger.warn(`[${trackerId}] Skip torrent, cause no url`, result);
      return false;
    } else
    if (!result.title) {
      logger.warn(`[${trackerId}] Skip torrent cause no title`, result);
      return false;
    } else {
      ['size', 'seeds', 'peers', 'date'].forEach(key => {
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
      result.sizeText = filesize(result.size);
      result.titleLowerCase = result.title.toLowerCase();
      result.categoryTitleLowerCase = (result.categoryTitle || '').toLowerCase();
      return true;
    }
  });
};

export default SearchStore;
export {TrackerSessionStore};