import {makeAutoObservable, observableRef, observable} from 'mobx';

import {saveOptions} from '../data/options';
import sortResults from '../tools/sortResults';
import type SearchResult from './ResultPageItemStore';
import type RootStore from './RootStore';
import type SearchStore from './SearchStore';

export default class SearchPageStore {
  private readonly root: RootStore;
  private readonly session: SearchStore;
  results = observable.array<SearchResult>([], {deep: false});
  private resultCounts = observable.map<string, number>();
  sorts: {by: string; direction: number}[];

  constructor(root: RootStore, session: SearchStore) {
    this.root = root;
    this.session = session;
    this.sorts = [...root.optionValues.sorts];
    makeAutoObservable<this, 'root' | 'session' | 'resultCounts'>(
      this,
      {
        root: false,
        session: false,
        results: false,
        resultCounts: false,
        sorts: observableRef,
      },
      {autoBind: true},
    );
  }

  sortBy(by: string) {
    this.updateSort(by, false);
  }

  appendSortBy(by: string) {
    this.updateSort(by, true);
  }

  private updateSort(by: string, append: boolean) {
    const direction = this.getSortBy(by)?.direction === 0 ? 1 : 0;
    const previous = append ? this.sorts.filter((sort) => sort.by !== by) : [];
    const sorts = [...previous, {by, direction}];
    this.sorts = sorts;
    void saveOptions((options) => ({...options, sorts}));
  }

  appendResults(trackerId: string, results: SearchResult[]) {
    this.results.push(...results);
    this.resultCounts.set(trackerId, (this.resultCounts.get(trackerId) ?? 0) + results.length);
  }

  get categoryId() {
    return this.session.categoryId;
  }

  get columns() {
    const columns = ['date', 'quality', 'title', 'size'];
    if (!this.root.optionValues.hideSeedRow) columns.push('seeds');
    if (!this.root.optionValues.hidePeerRow) columns.push('peers');
    return columns;
  }

  getSortBy(by: string) {
    return this.sorts.find((sort) => sort.by === by);
  }

  get filteredResults() {
    const ids = new Set(this.root.profiles.prepSelectedTrackerIds);
    const filter = this.root.filters.getFilter();
    return this.results.filter((result) => ids.has(result.trackerId) && filter(result));
  }

  get sortedAndFilteredResults() {
    const {categoryId} = this;
    return sortResults(
      categoryId === undefined
        ? this.filteredResults
        : this.filteredResults.filter((result) => result.categoryId === categoryId),
      this.sorts,
    );
  }

  get counters() {
    const trackers = new Map<string, number>();
    const categories = new Map<number, number>();
    for (const {trackerId, categoryId} of this.filteredResults) {
      trackers.set(trackerId, (trackers.get(trackerId) ?? 0) + 1);
      categories.set(categoryId, (categories.get(categoryId) ?? 0) + 1);
    }
    return {trackers, categories};
  }

  getResultCountByTrackerId(id: string) {
    return this.resultCounts.get(id) ?? 0;
  }

  getVisibleResultCountByTrackerId(id: string) {
    return this.counters.trackers.get(id) ?? 0;
  }

  getVisibleResultCountByCategoryId(id?: number) {
    return id === undefined ? this.filteredResults.length : (this.counters.categories.get(id) ?? 0);
  }
}
