import {queryOptions, useMutation, useQueryClient} from '@tanstack/react-query';
import type {ExplorerModule} from '../tools/getExplorerModules';
import getExplorerModules from '../tools/getExplorerModules';
import ExplorerModuleWorker from '../tools/explorerModuleWorker';
import {
  findExplorerCacheEntry,
  getExplorerCache,
  readExplorerCache,
  setExplorerCache,
} from '../tools/explorerCache';
import parseModuleParams from '../tools/parseModuleParams';
import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';

export interface ExplorerSection {
  id: string;
  moduleId: string;
  moduleParams: string;
  collapsed: boolean;
  rowCount: number;
  zoom: number;
}

const defaults: ExplorerSection[] = [
  'favorites',
  'kpFavorites',
  'kpInCinema',
  'imdbInCinema',
  'kpPopular',
  'imdbPopular',
  'kpSeries',
  'imdbSeries',
  'ggGamesNew',
  'ggGamesTop',
  'tmdbInCinema',
  'tmdbPopular',
  'tmdbSeries',
].map((id) => ({
  id,
  moduleId: id,
  moduleParams: id === 'kpFavorites' ? 'categoryId=%kpFolderId%' : '',
  collapsed: false,
  rowCount: 2,
  zoom: 100,
}));

async function readSections(): Promise<ExplorerSection[]> {
  const {explorerSections} = await storageGet({explorerSections: defaults}, 'sync');
  if (!Array.isArray(explorerSections)) return defaults;
  const saved = explorerSections
    .filter((section) => section && typeof section.id === 'string')
    .map(({id, moduleId, moduleParams, collapsed, rowCount, zoom}) => ({
      id,
      moduleId: typeof moduleId === 'string' ? moduleId : id,
      moduleParams: typeof moduleParams === 'string' ? moduleParams : '',
      collapsed: collapsed === true,
      rowCount: typeof rowCount === 'number' && rowCount > 0 ? rowCount : 2,
      zoom: typeof zoom === 'number' && zoom > 0 ? zoom : 100,
    }));
  const savedModules = new Set(saved.map(({moduleId}) => moduleId));
  const additions = defaults.filter(
    ({moduleId}) => moduleId.startsWith('tmdb') && !savedModules.has(moduleId),
  );
  return [...saved, ...additions];
}

export const explorerSections = queryOptions({
  queryKey: ['storage', 'sync', 'explorerSections'],
  queryFn: readSections,
});

export const explorerModules = queryOptions({
  queryKey: ['storage', 'local', 'explorerModules'],
  queryFn: getExplorerModules,
});

async function readFavorites() {
  const {explorerFavorites} = await storageGet(
    {explorerFavorites: null as PackagedExplorerItem[] | null},
    'sync',
  );
  return Array.isArray(explorerFavorites)
    ? explorerFavorites.filter(
        (item) => typeof item?.url === 'string' && typeof item.title === 'string',
      )
    : null;
}

export const explorerFavorites = queryOptions({
  queryKey: ['storage', 'sync', 'explorerFavorites'],
  queryFn: readFavorites,
});

export function useSaveSections() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (change: (sections: ExplorerSection[]) => ExplorerSection[]) =>
      navigator.locks.request('tsearch:explorer-sections', async () => {
        await storageSet({explorerSections: change(await readSections())}, 'sync');
      }),
    onSuccess: () => client.invalidateQueries({queryKey: explorerSections.queryKey}),
  }).mutate;
}

export function useSaveFavorites() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (change: (items: PackagedExplorerItem[]) => PackagedExplorerItem[]) =>
      navigator.locks.request('tsearch:explorer-favorites', async () => {
        await storageSet({explorerFavorites: change((await readFavorites()) ?? [])}, 'sync');
      }),
    onSuccess: () => client.invalidateQueries({queryKey: explorerFavorites.queryKey}),
  });
}

export function sectionItemsKey(id: string, moduleId: string, params: string) {
  return ['explorer-items', id, moduleId, params] as const;
}

function sectionCacheKey(id: string, params: string) {
  return params ? `${id}:${params}` : id;
}

export function cachedSectionItems(id: string, params: string) {
  const key = sectionCacheKey(id, params);
  return queryOptions({
    queryKey: ['storage', 'local', 'explorerCache'],
    queryFn: readExplorerCache,
    select: (cache) => findExplorerCacheEntry(cache, key)?.value,
  });
}

export async function fetchSectionItems(
  section: ExplorerSection,
  module: ExplorerModule,
  params: string,
  options?: {force?: boolean; command?: string; signal?: AbortSignal},
) {
  const {signal, command, force} = options ?? {};
  const cacheKey = sectionCacheKey(section.id, params);
  const ttl = module.meta.cacheTTL ?? 0;
  const source = ttl ? `${module.id}:${module.meta.version}` : undefined;
  if (!force && command === undefined) {
    const cached = await getExplorerCache(cacheKey, ttl, source);
    if (cached) return cached;
  }
  signal?.throwIfAborted();
  const worker = new ExplorerModuleWorker({
    ...module,
    meta: {...module.meta, connect: module.meta.connect ?? []},
  });
  const abort = () => worker.destroy();
  signal?.addEventListener('abort', abort, {once: true});
  try {
    const parsedParams = parseModuleParams(params);
    const result =
      command === undefined
        ? await worker.getItems(parsedParams)
        : await worker.sendCommand(command, parsedParams);
    if (result.items) await setExplorerCache(cacheKey, result.items, source);
    return result.items;
  } finally {
    signal?.removeEventListener('abort', abort);
    worker.destroy();
  }
}
