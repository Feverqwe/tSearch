import {hashKey} from '@tanstack/react-query';
import {filesize} from 'filesize';
import {makeAutoObservable, observable, runInAction} from 'mobx';

import getLogger from '../tools/getLogger';
import highlight, {type HighlightMap} from '../tools/highlight';
import type {QualityConfig} from '../tools/qualityConfig';
import {calculateQuality} from '../tools/qualityModel';
import rate, {type RateScheme} from '../tools/rate';
import type {NextPage, TrackerItem} from '../tools/trackerWorker';
import {unixTimeToFromNow, unixTimeToString} from '../tools/unixTimeTo';

import type SearchResult from './ResultPageItemStore';
import type RootStore from './RootStore';
import SearchPageStore from './SearchPageStore';

const logger = getLogger('search');
type SearchState = 'idle' | 'pending' | 'done' | 'error';
interface TrackerSearch {
  state: SearchState;
  nextQuery?: NextPage | null;
  authRequired?: {url: string | null};
  errorMessage?: string;
  httpStatus?: number;
  loadedPages?: Set<string>;
  retryPage?: SearchPageStore;
}

export default class SearchStore {
  readonly id: number;
  readonly query: string;
  private readonly root: RootStore;
  state: SearchState = 'idle';
  pages = observable.array<SearchPageStore>([], {deep: false});
  trackerSearch = observable.map<string, TrackerSearch>([], {deep: false});
  categoryId: number | undefined = undefined;
  private readonly urls = new Set<string>();
  private readonly queryHighlightMap: HighlightMap;
  private readonly queryRateScheme: RateScheme;
  readonly rankingTime = Date.now() / 1000;
  private closed = false;
  loadingMore = false;

  constructor(id: number, query: string, root: RootStore) {
    this.id = id;
    this.query = query;
    this.root = root;
    this.queryHighlightMap = highlight.getMap(query);
    this.queryRateScheme = rate.getScheme(query);
    makeAutoObservable<this, 'urls' | 'queryHighlightMap' | 'queryRateScheme' | 'root' | 'closed'>(
      this,
      {
        id: false,
        query: false,
        root: false,
        pages: false,
        trackerSearch: false,
        urls: false,
        closed: false,
        queryHighlightMap: false,
        queryRateScheme: false,
      },
      {autoBind: true},
    );
  }

  search() {
    if (this.state !== 'idle') return;
    return this.run(false);
  }

  searchNext() {
    if (this.state === 'idle' || this.state === 'pending') return;
    return this.run(true);
  }

  retryTracker(id: string) {
    const failed = this.trackerSearch.get(id);
    if (this.closed || failed?.state !== 'error' || !failed.retryPage) return;
    return this.searchTracker(id, Boolean(failed.nextQuery), failed.retryPage);
  }

  setCategoryId(categoryId?: number) {
    this.categoryId = categoryId;
  }

  private async run(next: boolean) {
    if (this.closed) return;
    const ids = this.root.profiles.prepSelectedTrackerIds.filter((id) => {
      if (!this.root.trackers.getTrackerById(id)) return false;
      const tracker = this.trackerSearch.get(id);
      return !next || (tracker?.state !== 'pending' && Boolean(tracker?.nextQuery));
    });
    if (ids.length === 0) {
      if (this.state === 'idle') this.state = 'done';
      return;
    }
    this.state = 'pending';
    this.loadingMore = next;
    const singleTable = this.root.optionValues.singleResultTable;
    let page = singleTable ? this.pages[0] : undefined;
    try {
      await Promise.all(
        ids.map((id) => {
          const retryPage =
            next && !singleTable ? this.trackerSearch.get(id)?.retryPage : undefined;
          return this.searchTracker(id, next, retryPage ?? (page ??= this.addPage()));
        }),
      );
      if (!this.closed)
        runInAction(() => {
          this.state = 'done';
          this.loadingMore = false;
        });
    } catch (error) {
      if (!this.closed)
        runInAction(() => {
          this.state = 'error';
          this.loadingMore = false;
        });
      logger.error('Search failed', error);
    }
  }

  private addPage() {
    const page = new SearchPageStore(this.root, this);
    this.pages.push(page);
    return page;
  }

  private async searchTracker(id: string, next: boolean, page: SearchPageStore) {
    const previous = this.trackerSearch.get(id);
    const nextQuery = next ? previous?.nextQuery : undefined;
    if (next && !nextQuery) return;
    const loadedPages = next ? (previous?.loadedPages ?? new Set<string>()) : undefined;
    this.trackerSearch.set(id, {state: 'pending', nextQuery});
    const tracker = this.root.trackers.getTrackerById(id);
    try {
      if (!tracker) throw new Error(`Tracker ${id} is missing`);
      const profileTracker = this.root.profiles.profile?.trackers.find(
        (config) => config.id === id,
      );
      tracker.setProfileOptions(profileTracker?.options ?? {});
      tracker.attach();
      const worker = tracker.worker;
      if (!worker) throw new Error('Tracker worker is not available');
      const response = nextQuery
        ? await worker.searchNext(nextQuery)
        : await worker.search(this.query);
      if (!response?.success) throw new Error('Tracker returned no results');
      if (this.closed) return;
      const loadedKey = nextQuery && hashKey([nextQuery]);
      const candidate = response.nextPageRequest;
      const candidateKey = loadedPages && candidate && hashKey([candidate]);
      const results = prepSearchResults(
        id,
        this.queryHighlightMap,
        this.queryRateScheme,
        response.results,
        this.root.qualitySettings,
        this.root.optionValues.defineCategory,
        this.rankingTime,
        this.urls,
      );
      runInAction(() => {
        page.appendResults(id, results);
        for (const {url} of results) this.urls.add(url);
        if (loadedKey) loadedPages?.add(loadedKey);
        this.trackerSearch.set(id, {
          state: 'done',
          nextQuery: candidateKey && loadedPages?.has(candidateKey) ? null : candidate,
          loadedPages,
        });
      });
    } catch (error) {
      if (this.closed) return;
      let authRequired: TrackerSearch['authRequired'];
      let errorMessage: string | undefined;
      let httpStatus: number | undefined;
      if (error && typeof error === 'object' && 'code' in error && error.code === 'AUTH_REQUIRED') {
        authRequired = {url: 'url' in error && typeof error.url === 'string' ? error.url : null};
      } else {
        if (
          error instanceof Error &&
          error.name === 'StatusCodeError' &&
          'statusCode' in error &&
          typeof error.statusCode === 'number'
        ) {
          httpStatus = error.statusCode;
        } else if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === 'string') errorMessage = error;
        logger.error(`[${id}] search failed`, error);
      }
      runInAction(() => {
        this.trackerSearch.set(id, {
          state: 'error',
          authRequired,
          errorMessage,
          httpStatus,
          nextQuery,
          loadedPages,
          retryPage: page,
        });
      });
    } finally {
      tracker?.deattach();
    }
  }

  regrade() {
    const settings = this.root.qualitySettings;
    const defineCategory = this.root.optionValues.defineCategory;
    if (!defineCategory) this.setCategoryId(undefined);
    for (const page of this.pages) {
      page.results.replace(
        page.results.map((result) => ({
          ...result,
          ...rank(result, settings, this.rankingTime, defineCategory),
        })),
      );
    }
  }

  dispose() {
    this.closed = true;
  }

  getResultCountByTrackerId(id: string) {
    return this.pages.reduce((total, page) => total + page.getResultCountByTrackerId(id), 0);
  }

  getVisibleResultCountByTrackerId(id: string) {
    return this.pages.reduce((total, page) => total + page.getVisibleResultCountByTrackerId(id), 0);
  }

  get waitingForFirstResponse() {
    return (
      this.state === 'pending' &&
      !this.loadingMore &&
      [...this.trackerSearch.values()].every(({state}) => state === 'pending')
    );
  }

  get hasSuccessfulResponse() {
    return [...this.trackerSearch.values()].some(
      ({state, nextQuery}) => state === 'done' || Boolean(nextQuery),
    );
  }

  get hasNextQuery() {
    return this.root.profiles.prepSelectedTrackerIds.some(
      (id) => this.trackerSearch.get(id)?.nextQuery && this.root.trackers.getTrackerById(id),
    );
  }
}

function prepSearchResults(
  trackerId: string,
  queryHighlightMap: HighlightMap,
  queryRateScheme: RateScheme,
  results: TrackerItem[],
  settings: QualityConfig,
  defineCategory: boolean,
  now: number,
  knownUrls: ReadonlySet<string>,
): SearchResult[] {
  const prepared: SearchResult[] = [];
  const pageUrls = new Set<string>();
  for (const result of results) {
    if (
      !result ||
      typeof result.url !== 'string' ||
      !result.url.trim() ||
      typeof result.title !== 'string' ||
      !result.title.trim() ||
      knownUrls.has(result.url) ||
      pageUrls.has(result.url)
    ) {
      logger.warn(`[${trackerId}] Skip invalid or duplicate result`, result);
      continue;
    }
    pageUrls.add(result.url);

    const date = readNumber(result.date);
    const size = readNumber(result.size);
    const seeds = readNumber(result.seeds);
    const peers = readNumber(result.peers);
    const itemRate = rate.getRate(result, queryRateScheme);
    const categoryTitle =
      typeof result.categoryTitle === 'string' || result.categoryTitle === null
        ? result.categoryTitle
        : undefined;
    const ranking = rank(
      {
        title: result.title,
        categoryTitle,
        date,
        size,
        seeds,
        peers,
        rate: itemRate,
      },
      settings,
      now,
      defineCategory,
    );
    let sizeText = '—';
    try {
      if (typeof size === 'number') sizeText = filesize(size);
    } catch (error) {
      logger.debug('Invalid result size', error);
    }
    prepared.push({
      ...result,
      trackerId,
      ...ranking,
      date,
      size,
      sizeText,
      categoryTitle,
      categoryTitleLowerCase: categoryTitle?.toLowerCase() ?? '',
      seeds,
      peers,
      titleMatches: highlight.getMatches(result.title, queryHighlightMap),
      rate: itemRate,
      dateTitle: unixTimeToString(date),
      dateText: unixTimeToFromNow(date),
      titleLowerCase: result.title.toLowerCase(),
    });
  }
  return prepared;
}

function rank(
  result: Pick<
    SearchResult,
    'title' | 'categoryTitle' | 'date' | 'size' | 'seeds' | 'peers' | 'rate'
  >,
  settings: QualityConfig,
  now: number,
  defineCategory: boolean,
) {
  const {quality, categoryId, score} = calculateQuality(
    settings,
    {
      ...result,
      relevance: result.rate.sum,
    },
    now,
    defineCategory,
  );
  return {
    quality,
    categoryId,
    titleMatchTier: result.rate.titleMatch.tier,
    qualityLabel:
      score.contributions.find(({criterion}) => criterion === 'video')?.rule ??
      score.contributions.find(({criterion}) => criterion === 'audio' || criterion === 'game')
        ?.rule ??
      '',
  };
}

function readNumber(value: number | string | null | undefined) {
  const number = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  return typeof number === 'number' && Number.isFinite(number) ? number : undefined;
}
