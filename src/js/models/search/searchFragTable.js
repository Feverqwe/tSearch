import sortResults from "../../tools/sortResults";
import {types, getParent, isAlive, detach, unprotect, getRoot, getSnapshot} from "mobx-state-tree";

const debug = require('debug')('searchFragTable');

/**
 * @typedef {{}} SearchFragTableM
 * Model:
 * @property {string} id
 * @property {number} index
 * @property {SortBy[]} sortByList
 * Actions:
 * @property {function(string)} sortBy
 * @property {function(string)} subSortBy
 * Views:
 * @property {FilterM} filter
 * @property {ProfileM} profile
 * @property {SearchFragM} searchFrag
 * @property {function(TrackerSearchM):TrackerResultM[]} getTrackerResults
 * @property {function(TrackerSearchM):TrackerResultM[]} getFilteredTrackerResults
 * @property {function:TrackerResultM[]} getResults
 * @property {function:TrackerResultM[]} getFilteredResults
 * @property {function:TrackerResultM[]} getSortedFilteredResults
 * @property {function:boolean} hasMoreBtn
 * @property {function(string):SortBy} getSortBy
 * @property {function(Object)} handleMoreBtn
 * @property {function:boolean} isLastTable
 * @property {function(TrackerSearchM):number} getTrackerResultCount
 * @property {function(TrackerSearchM):number} getTrackerVisibleResultCount
 */

/**
 * @typedef {{}} SortBy
 * @property {string} by
 * @property {number} direction
 */

const searchFragTableModel = types.model('searchFragTableModel', {
  id: types.identifier(types.string),
  index: types.number,
  sortByList: types.array(types.model('sortBy', {
    by: types.string,
    direction: types.optional(types.number, 0),
  })),
}).actions(/**SearchFragTableM*/self => {
  return {
    sortBy(by) {
      let item = self.getSortBy(by);
      if (!item) {
        item = {by};
      } else {
        item.direction = item.direction === 0 ? 1 : 0;
      }
      self.sortByList = [item];

      getRoot(self).localStore.set('sortByList', getSnapshot(self.sortByList));
    },
    subSortBy(by) {
      let item = self.getSortBy(by);
      if (item) {
        detach(item);
        unprotect(item);
      }
      if (!item) {
        item = {by};
      } else {
        item.direction = item.direction === 0 ? 1 : 0;
      }
      self.sortByList.push(item);

      getRoot(self).localStore.set('sortByList', getSnapshot(self.sortByList));
    }
  };
}).views(/**SearchFragTableM*/self => {
  return {
    get searchFrag() {
      return getParent(self, 2);
    },
    get filter() {
      return getParent(self, 3).filter;
    },
    get profile() {
      return getParent(self, 3).profile;
    },
    getTrackerResults(trackerSearch) {
      return trackerSearch.getResultsPage(self.index);
    },
    getFilteredTrackerResults(trackerSearch) {
      return self.filter.processResults(trackerSearch.getResultsPage(self.index));
    },
    getResults() {
      const results = [];
      self.searchFrag.trackerSearchList.forEach(trackerSearch => {
        results.push(...self.getTrackerResults(trackerSearch));
      });
      return results;
    },
    getFilteredResults() {
      const results = [];
      self.searchFrag.getSelectedTrackerSearch().forEach(trackerSearch => {
        results.push(...self.getFilteredTrackerResults(trackerSearch));
      });
      return results;
    },
    getSortedFilteredResults() {
      return sortResults(self.getFilteredResults(), self.sortByList);
    },
    hasMoreBtn() {
      if (self.isLastTable()) {
        return self.searchFrag.getSelectedTrackerSearch().some(trackerSearch => {
          return !!trackerSearch.nextQuery;
        });
      }
    },
    getSortBy(by) {
      let result = null;
      self.sortByList.some(sortBy => {
        if (sortBy.by === by) {
          result = sortBy;
          return true;
        }
      });
      return result;
    },
    handleMoreBtn(e) {
      e.preventDefault();
      self.searchFrag.searchNext();
    },
    isLastTable() {
      return self === self.searchFrag.tables.slice(-1)[0];
    },
    getTrackerResultCount(trackerSearch) {
      return self.getTrackerResults(trackerSearch).length;
    },
    getTrackerVisibleResultCount(trackerSearch) {
      const selected = self.searchFrag.getSelectedTrackerSearch();
      if (selected.indexOf(trackerSearch) !== -1) {
        return self.getFilteredTrackerResults(trackerSearch).length;
      } else {
        return 0;
      }
    },
  };
});

export default searchFragTableModel;