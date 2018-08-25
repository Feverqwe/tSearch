import {types, getParentOfType} from "mobx-state-tree";
import ResultPageItemStore from "./ResultPageItemStore";
import RootStore from "./RootStore";
import sortResults from "../tools/sortResults";


/**
 * @typedef {{}} SearchPageStore
 * @property {ResultPageItemStore[]} results
 * @property {{by:string,[direction]:number}[]} sorts
 * @property {function} sortBy
 * @property {function} appendSortBy
 * @property {function} getSortBy
 * @property {function} getFilteredResults
 * @property {function} getSortedAndFilteredResults
 */
const SearchPageStore = types.model('SearchPageStore', {
  results: types.array(ResultPageItemStore),
  sorts: types.array(types.model({
    by: types.string,
    direction: types.optional(types.number, 0),
  })),
}).actions(self => {
  return {
    sortBy(by) {
      const item = self.getSortBy(by);
      const newItem = {by};
      if (item) {
        newItem.direction = item.direction === 0 ? 1 : 0
      }
      self.sorts = [newItem];
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
    getFilteredResults() {
      const /**RootStore*/rootStore = getParentOfType(self, RootStore);
      return rootStore.filters.processResults(this.results);
    },
    getSortedAndFilteredResults() {
      return sortResults(self.getFilteredResults(), self.sorts);
    }
  };
});

export default SearchPageStore;