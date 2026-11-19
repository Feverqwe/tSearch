import {queryOptions, useMutation, useQueryClient} from '@tanstack/react-query';

import getNow from '../tools/getNow';
import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';

export interface HistoryClick {
  url: string;
  title: string;
  trackerId: string;
  time: number;
}

export interface HistoryEntry {
  query: string;
  count: number;
  time: number;
  clicks: Record<string, HistoryClick>;
}

type History = Record<string, HistoryEntry>;
export type HistoryChange =
  | {type: 'search'; query: string}
  | {type: 'click'; query: string; result: Omit<HistoryClick, 'time'>}
  | {type: 'remove-query'; query: string}
  | {type: 'remove-click'; query: string; url: string};

async function readHistory(): Promise<History> {
  const {history} = await storageGet({history: {} as History});
  if (!history || typeof history !== 'object' || Array.isArray(history)) return {};
  return Object.fromEntries(
    Object.entries(history).flatMap(([query, entry]) => {
      if (!entry || entry.query !== query || typeof entry.time !== 'number') return [];
      const clicks = Object.fromEntries(
        Object.entries(entry.clicks ?? {}).filter(
          ([url, click]) =>
            click?.url === url &&
            typeof click.title === 'string' &&
            typeof click.trackerId === 'string' &&
            typeof click.time === 'number',
        ),
      );
      return [
        [
          query,
          {
            query,
            time: entry.time,
            count: typeof entry.count === 'number' ? entry.count : 0,
            clicks,
          },
        ],
      ];
    }),
  );
}

export const historyQuery = queryOptions({
  queryKey: ['storage', 'local', 'history'],
  queryFn: readHistory,
});

function trim<T extends {time: number}>(entries: Record<string, T>) {
  const values = Object.entries(entries);
  if (values.length <= 150) return entries;
  return Object.fromEntries(values.sort(([, a], [, b]) => b.time - a.time).slice(0, 100));
}

function changeHistory(history: History, change: HistoryChange) {
  const {query} = change;
  if (change.type === 'remove-query') {
    delete history[query];
    return history;
  }
  const time = getNow();
  const existing = Object.hasOwn(history, query) ? history[query] : undefined;
  const entry: HistoryEntry = existing ?? {query, count: 0, time, clicks: {}};
  if (change.type === 'search') {
    return trim({...history, [query]: {...entry, count: (entry.count ?? 0) + 1, time}});
  }
  if (change.type === 'click') {
    const clicks = trim({...entry.clicks, [change.result.url]: {...change.result, time}});
    return trim({...history, [query]: {...entry, clicks}});
  }
  if (existing) {
    const clicks = {...existing.clicks};
    delete clicks[change.url];
    return {...history, [query]: {...existing, clicks}};
  }
  return history;
}

export function useHistoryMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (change: HistoryChange) =>
      navigator.locks.request('tsearch:history', async () => {
        const history = changeHistory(await readHistory(), change);
        await storageSet({history});
      }),
    onSuccess: () => client.invalidateQueries({queryKey: historyQuery.queryKey}),
  });
}

export function useChangeHistory() {
  return useHistoryMutation().mutate;
}
