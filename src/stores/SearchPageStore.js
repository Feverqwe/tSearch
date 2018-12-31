import {getParentOfType, types} from "mobx-state-tree";
import ResultPageItemStore from "./ResultPageItemStore";
import RootStore from "./RootStore";
import sortResults from "../tools/sortResults";
import SearchStore from "./SearchStore";


/**
 * @typedef {{}} SearchPageStore
 * @property {ResultPageItemStore[]} results
 * @property {{by:string,[direction]:number}[]} sorts
 * @property {Map<*,number>} trackerIdCountMap
 * @property {function} sortBy
 * @property {function} appendSortBy
 * @property {function} appendResults
 * @property {function} incTrackerCount
 * @property {function} getSortBy
 * @property {function} getFilterBySelectedTrackers
 * @property {function} getCategoryFilter
 * @property {*} filteredResults
 * @property {*} sortedAndFilteredResults
 * @property {function} getResultCountByTrackerId
 * @property {function} getResultCountByCategoryId
 * @property {function} getVisibleResultCountByTrackerId
 */
const SearchPageStore = types.model('SearchPageStore', {
  results: types.array(ResultPageItemStore),
  sorts: types.array(types.model({
    by: types.string,
    direction: types.optional(types.number, 0),
  })),
  categoryId: types.maybe(types.number),
  trackerIdCountMap: types.map(types.number),
}).actions(self => {
  return {
    sortBy(by) {
      const item = self.getSortBy(by);
      const newItem = {by};
      if (item) {
        newItem.direction = item.direction === 0 ? 1 : 0
      }
      self.sorts = [newItem];

      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      rootStore.options.options.setValue('sorts', JSON.parse(JSON.stringify(self.sorts)));
      rootStore.options.save();
    },
    appendSortBy(by) {
      const sorts = self.sorts.slice(0);
      const item = self.getSortBy(by);
      const pos = sorts.indexOf(item);
      if (pos !== -1) {
        sorts.splice(pos, 1);
      }
      const newItem = {by};
      if (item) {
        newItem.direction = item.direction === 0 ? 1 : 0
      }
      sorts.push(newItem);
      self.sorts = sorts;

      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      rootStore.options.options.setValue('sorts', JSON.parse(JSON.stringify(self.sorts)));
      rootStore.options.save();
    },
    appendResults(trackerId, results) {
      self.results.push(...results);
      self.incTrackerCount(trackerId, results.length);
    },
    incTrackerCount(trackerId, count) {
      const trackerIdCount = self.trackerIdCountMap.get(trackerId) || 0;
      self.trackerIdCountMap.set(trackerId, trackerIdCount + count);
    },
    setCategoryId(value) {
      const /**SearchStore*/searchStore = getParentOfType(self, SearchStore);
      searchStore.setCategoryId(value);
      self.categoryId = value;
    }
  };
}).views(self => {
  return {
    getSortBy(by) {
      let result = null;
      self.sorts.some(sort => {
        if (sort.by === by) {
          result = sort;
          return true;
        }
      });
      return result;
    },
    getFilterBySelectedTrackers() {
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      const prepSelectedTrackerIds = rootStore.profiles.prepSelectedTrackerIds;
      return result => {
        return prepSelectedTrackerIds.indexOf(result.trackerId) !== -1;
      };
    },
    getCategoryFilter() {
      return result => {
        const categoryId = self.categoryId;
        if (categoryId === undefined) {
          return true;
        } else {
          return result.categoryId === categoryId;
        }
      };
    },
    get filteredResults() {
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      return multiFilter(self.results, self.getFilterBySelectedTrackers(), rootStore.filters.getFilter());
    },
    get sortedAndFilteredResults() {
      const categoryFilter = self.getCategoryFilter();
      return sortResults(self.filteredResults.filter(categoryFilter), self.sorts);
    },
    getResultCountByTrackerId(id) {
      return self.trackerIdCountMap.get(id) || 0;
    },
    getResultCountByCategoryId(id) {
      if (id === undefined) {
        return self.filteredResults.length;
      }
      return self.filteredResults.filter(result => {
        return result.categoryId === id;
      }).length;
    },
    getVisibleResultCountByTrackerId(id) {
      return self.filteredResults.filter(result => {
        return result.trackerId === id;
      }).length;
    }
  };
});

const multiFilter = (allResults, ...filters) => {
  const filtersLen = filters.length;
  return allResults.filter(item => {
    let result = true;
    for (let i = 0; i < filtersLen; i++) {
      if (filters[i](item) === false) {
        result = false;
        break;
      }
    }
    return result;
  });
};

export default SearchPageStore;