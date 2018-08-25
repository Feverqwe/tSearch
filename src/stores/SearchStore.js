import {flow, getParentOfType, isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import RootStore from "./RootStore";
import TrackerStore from "./TrackerStore";
import highlight from "../tools/highlight";
import rate from "../tools/rate";
import {unixTimeToFromNow, unixTimeToString} from "../tools/unixTimeTo";
import filesize from "filesize";
import {ErrorWithCode} from "../tools/errors";

const logger = getLogger('SearchStore');

/**
 * @typedef {{}} ResultPageItemStore
 * @property {string} id
 * @property {string} trackerId
 * @property {string} title
 * @property {*} titleHighlightMap
 * @property {string} url
 * @property {*} rate
 * @property {number} quality
 * @property {number|undefined|null} categoryId
 * @property {string|undefined|null} categoryTitle
 * @property {string|undefined|null} categoryUrl
 * @property {number|undefined|null} size
 * @property {string|undefined|null} downloadUrl
 * @property {number|undefined|null} seed
 * @property {number|undefined|null} peer
 * @property {number|undefined|null} date
 * @property {string} dateTitle
 * @property {string} dateText
 * @property {string} sizeText
 */
const ResultPageItemStore = types.model('ResultPageItemStore', {
  id: types.identifier,
  trackerId: types.string,
  title: types.string,
  titleHighlightMap: types.frozen(),
  url: types.string,
  rate: types.frozen(),
  quality: types.number,
  categoryId: types.maybeNull(types.number),
  categoryTitle: types.maybeNull(types.string),
  categoryUrl: types.maybeNull(types.string),
  size: types.maybeNull(types.number),
  downloadUrl: types.maybeNull(types.string),
  seed: types.maybeNull(types.number),
  peer: types.maybeNull(types.number),
  date: types.maybeNull(types.number),
  dateTitle: types.string,
  dateText: types.string,
  sizeText: types.string,
});

/**
 * @typedef {{}} TrackerSessionStore
 * @property {string} id
 * @property {string} [state]
 * @property {*} nextQuery
 * @property {number} [searchIndex]
 * @property {function:Promise} fetchResult
 * @property {*} tracker
 */
const TrackerSessionStore = types.model('TrackerSessionStore', {
  id: types.identifier,
  state: types.optional(types.enumeration('State', ['idle', 'pending', 'done', 'error']), 'idle'),
  nextQuery: types.frozen(),
  searchIndex: types.optional(types.number, 0),
}).actions(self => {
  return {
    fetchResult: flow(function* () {
      const id = self.id;
      self.state = 'pending';
      try {
        self.searchIndex++;
        const searchStore = getParentOfType(self, SearchStore);
        const queryHighlightMap = highlight.getMap(searchStore.query);
        const queryRateScheme = rate.getScheme(searchStore.query);
        let result = null;
        if (self.searchIndex === 1) {
          result = yield self.tracker.worker.search(searchStore.query);
        } else
        if (self.nextQuery) {
          const nextQuery = self.nextQuery;
          self.nextQuery = null;
          result = yield self.tracker.worker.searchNext(self.nextQuery);
        }
        if (!result) {
          throw new ErrorWithCode(`Search error: result is empty`, 'EMPTY_RESULT');
        }
        if (!result.success) {
          if (result.error === 'AUTH') {
            if (isAlive(self)) {
              self.tracker.setAuthRequired(result.url);
            }
            throw new ErrorWithCode(`Search error: auth required`, 'AUTH_REQUIRED');
          } else {
            throw new ErrorWithCode(`Search error: not success`, 'NOT_SUCCESS');
          }
        }
        if (isAlive(self)) {
          if (result.nextPageRequest) {
            self.nextQuery = result.nextPageRequest;
          }
          self.state = 'done';
        }
        return prepSearchResults(self.id, queryHighlightMap, queryRateScheme, result.results);
      } catch (err) {
        logger.error(`[${id}] fetchResult error`, err);
        if (isAlive(self)) {
          self.state = 'error';
        }
        return [];
      }
    }),
  };
}).views(self => {
  return {
    get tracker() {
      return resolveIdentifier(TrackerStore, self, self.id);
    }
  };
});

/**
 * @typedef {{}} SearchStore
 * @property {string} [state]
 * @property {string} query
 * @property {Map<*,TrackerSessionStore>} trackerSessions
 * @property {ResultPageItemStore[][]} resultPages
 * @property {function:Promise} fetchResults
 * @property {function} getTrackerSessions
 */
const SearchStore = types.model('SearchStore', {
  state: types.optional(types.enumeration('State', ['idle', 'pending', 'done', 'error']), 'idle'),
  query: types.string,
  trackerSessions: types.map(TrackerSessionStore),
  resultPages: types.array(types.array(ResultPageItemStore)),
}).actions(self => {
  return {
    fetchResults: flow(function* () {
      self.state = 'pending';
      try {
        const results = yield Promise.all(self.getTrackerSessions().map(trackerSession => {
          return trackerSession.fetchResult();
        }));
        const resultPage = [].concat(...results);
        if (isAlive(self)) {
          self.resultPages.push(resultPage);
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchResults error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    getTrackerSessions() {
      const result = [];
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      rootStore.profile.selectedTrackers.forEach(profileItemTracker => {
        const /**TrackerStore*/tracker = profileItemTracker.tracker;
        if (tracker.state === 'done') {
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
      ['size', 'seed', 'peer', 'date'].forEach(key => {
        let value = result[key];
        if (['undefined', 'number'].indexOf(typeof value) === -1) {
          value = parseInt(value, 10);
          if (!Number.isFinite(value)) {
            value = undefined;
          }
          result[key] = value;
        }
      });
      result.id = result.url;
      result.trackerId = trackerId;
      result.titleHighlightMap = highlight.getTextMap(result.title, queryHighlightMap);
      const itemRate = rate.getRate(result, queryRateScheme);
      result.rate = itemRate;
      result.quality = itemRate.sum;
      result.dateTitle = unixTimeToString(result.date);
      result.dateText = unixTimeToFromNow(result.date);
      result.sizeText = filesize(result.size);
      return true;
    }
  });
};

export default SearchStore;