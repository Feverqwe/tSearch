import {makeAutoObservable, observableRef, runInAction} from 'mobx';

import {collectQuickResults, saveQuickResults} from '../data/quickSearch';
import getLogger from '../tools/getLogger';

import type RootStore from './RootStore';
import type SearchStore from './SearchStore';

interface QuickSearchRun {
  cardId: string;
  profileId?: string;
  search: SearchStore;
  failed?: boolean;
}

const logger = getLogger('quick search');

export default class QuickSearchStore {
  private readonly root: RootStore;
  private run: QuickSearchRun | undefined = undefined;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root' | 'run'>(
      this,
      {root: false, run: observableRef},
      {autoBind: true},
    );
  }

  get ready() {
    return this.root.searchReady;
  }

  get current() {
    return this.run?.profileId === this.root.profiles.profile?.id ? this.run : undefined;
  }

  get state() {
    const run = this.current;
    if (!run) return undefined;
    const {search} = run;
    if (run.failed) return 'failed';
    if (search.state === 'pending') return 'pending';
    if (!search.trackerSearch.size) return 'unavailable';
    return search.hasSuccessfulResponse ? 'ready' : 'failed';
  }

  get results() {
    const state = this.state;
    const search = this.current?.search;
    if (!search || (state !== 'ready' && state !== 'pending')) return undefined;
    const results = collectQuickResults(search);
    return state === 'ready' || results.length > 0 ? results : undefined;
  }

  async start(cardId: string, query: string) {
    if (!this.ready) return;
    const active = this.current;
    if (
      active?.cardId === cardId &&
      active.search.query === query &&
      active.search.state === 'pending' &&
      !active.failed
    )
      return;

    this.clear();
    const search = this.root.createSearch(query);
    const run: QuickSearchRun = {
      cardId,
      profileId: this.root.profiles.profile?.id,
      search,
    };
    this.run = run;
    const isCurrent = () => this.current?.search === search;
    try {
      await search.search();
    } catch (error) {
      logger.error('Search failed', error);
      if (isCurrent()) runInAction(() => (this.run = {...run, failed: true}));
      return;
    }
    if (isCurrent() && this.state === 'ready') {
      void saveQuickResults(query, collectQuickResults(search), isCurrent).catch((error) =>
        logger.error('Could not save results', error),
      );
    }
  }

  cancel(cardId: string) {
    if (this.run?.cardId === cardId && this.run.search.state === 'pending' && !this.run.failed)
      this.clear();
  }

  clear() {
    if (this.run) this.root.destroySearch(this.run.search.id);
    this.run = undefined;
  }
}
