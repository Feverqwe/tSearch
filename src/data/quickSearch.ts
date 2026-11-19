import {queryOptions} from '@tanstack/react-query';

import type SearchStore from '../stores/SearchStore';
import getNow from '../tools/getNow';
import isTrailer from '../tools/isTrailer';
import sortResults from '../tools/sortResults';
import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';
import {type TitleMatchScore, evaluateTitleMatch} from '../tools/titleMatch';
import {prepareTitleQuery} from '../tools/titleMatchFeatures';

export interface QuickResult {
  label: string;
  url: string;
  title: string;
  size?: number;
  sizeText: string;
  quality: number;
  titleMatchTier?: number;
  trackerId: string;
}

interface QuickSearchEntry {
  query: string;
  time: number;
  results: QuickResult[];
}

async function readQuickSearch() {
  const {quickSearch} = await storageGet({quickSearch: {} as Record<string, QuickSearchEntry>});
  return quickSearch ?? {};
}

export function savedQuickResults(query: string) {
  const titleQuery = prepareTitleQuery(query);
  return queryOptions({
    queryKey: ['storage', 'local', 'quickSearch'],
    queryFn: readQuickSearch,
    select: (entries) => {
      const results = entries[query]?.results;
      return Array.isArray(results)
        ? results.filter(({title}) => quickMatch(title, evaluateTitleMatch(titleQuery, title)))
        : undefined;
    },
  });
}

function quickMatch(title: string, match: TitleMatchScore) {
  return !isTrailer(title) && match.tier === 3 && match.score >= 0.8;
}

export function collectQuickResults(search: SearchStore): QuickResult[] {
  const results = search.pages.flatMap(({results}) =>
    results
      .filter(({title, rate}) => quickMatch(title, rate.titleMatch))
      .map((result): QuickResult => ({
        title: result.title,
        url: result.url,
        size: result.size,
        sizeText: result.sizeText,
        trackerId: result.trackerId,
        label: result.qualityLabel ?? '',
        quality: result.quality,
        titleMatchTier: result.titleMatchTier,
      })),
  );
  return sortResults(results, [{by: 'quality', direction: 0}]).slice(0, 5);
}

export async function saveQuickResults(
  query: string,
  results: QuickResult[],
  isCurrent: () => boolean,
) {
  await navigator.locks.request('tsearch:quick-search', async () => {
    if (!isCurrent()) return;
    const previous = await readQuickSearch();
    if (!isCurrent()) return;
    const quickSearch = {...previous, [query]: {query, time: getNow(), results}};
    const entries = Object.entries(quickSearch);
    const saved =
      entries.length > 150
        ? Object.fromEntries(entries.sort(([, a], [, b]) => b.time - a.time).slice(0, 100))
        : quickSearch;
    await storageSet({quickSearch: saved});
  });
}
