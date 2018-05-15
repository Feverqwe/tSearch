import searchFragTableModel from "./searchFragTable";
import trackerSearchModel from "./trackerSearch";
import {types, getParent, isAlive, getRoot, destroy, resolveIdentifier} from "mobx-state-tree";

const debug = require('debug')('searchFrag');

/**
 * @typedef {{}} SearchFragM
 * Model:
 * @property {string} state
 * @property {number} id
 * @property {string} query
 * @property {TrackerSearchM[]} trackerSearchList
 * @property {SearchFragTableM[]} tables
 * Actions:
 * @property {function(string)} setState
 * @property {function} search
 * @property {function} searchNext
 * @property {function} clearSearch
 * Views:
 * @property {ProfileM} profile
 * @property {function:string} getTableId
 * @property {function:TrackerSearchM[]} getSelectedTrackerSearch
 * @property {function(TrackerSearchM):number} getTrackerResultCount
 * @property {function(TrackerSearchM):number} getTrackerVisibleResultCount
 * @property {function(ProfileM):number} getSearchTrackerByTracker
 */

const searchFragModel = types.model('searchFragModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, done
  id: types.identifier(types.number),
  query: types.string,
  trackerSearchList: types.optional(types.array(trackerSearchModel), []),
  tables: types.optional(types.array(searchFragTableModel), []),
}).actions(/**SearchFragM*/self => {
  const isReady = () => {
    if (self.state !== 'done') {
      throw new Error('SearchFrag is not ready');
    }
  };

  return {
    setState(value) {
      self.state = value;
    },
    search() {
      isReady();
      self.clearSearch();
      self.tables.push(searchFragTableModel.create({
        id: self.getTableId(),
        index: self.tables.length,
        sortByList: getRoot(self).localStore.sortByList,
      }));
      self.profile.getSelectedProfileTrackers().forEach(profileTracker => {
        const trackerSearch = trackerSearchModel.create({
          id: self.id + '_' + profileTracker.id,
          query: self.query,
          trackerId: profileTracker.id
        });
        self.trackerSearchList.push(trackerSearch);
        trackerSearch.search();
      });
    },
    searchNext() {
      isReady();
      self.tables.push(searchFragTableModel.create({
        id: self.getTableId(),
        index: self.tables.length,
        sortByList: getRoot(self).localStore.sortByList,
      }));
      self.trackerSearchList.forEach(trackerSearch => {
        trackerSearch.searchNext();
      });
    },
    clearSearch() {
      self.tables.forEach(table => {
        destroy(table);
      });
      self.trackerSearchList.forEach(trackerSearch => {
        destroy(trackerSearch);
      });
    },
  };
}).views(/**SearchFragM*/self => {
  let readyPromise = null;

  return {
    get readyPromise() {
      return readyPromise;
    },
    get profile() {
      return getParent(self, 1).profile;
    },
    getTableId() {
      return self.id + '_' + self.tables.length;
    },
    getSelectedTrackerSearch() {
      return self.profile.getSelectedProfileTrackers().map(profileTracker => {
        return self.getSearchTrackerByTracker(profileTracker);
      }).filter(a => !!a);
    },
    getTrackerResultCount(trackerSearch) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerResultCount(trackerSearch);
      }, 0);
    },
    getTrackerVisibleResultCount(trackerSearch) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerVisibleResultCount(trackerSearch);
      }, 0);
    },
    getSearchTrackerByTracker(profile) {
      return resolveIdentifier(trackerSearchModel, self, self.id + '_' + profile.id);
    },
    afterCreate() {
      self.setState('loading');
      readyPromise = self.profile.readyPromise.then(() => {
        if (isAlive(self)) {
          self.setState('done');
          self.search();
        } else {
          debug('skip, dead');
        }
      }).catch(err => {
        debug('afterCreate error', err);
      });
    }
  };
});

export default searchFragModel;