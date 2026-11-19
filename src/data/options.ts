import {queryOptions, useMutation, useQueryClient} from '@tanstack/react-query';

import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';
import {readTabProxyMode} from '../tools/tabProxy';
import {defaultTitlePresentation, readTitlePresentation} from '../tools/titlePresentation';

const sections = {
  favorites: true,
  kpFavorites: true,
  kpInCinema: true,
  imdbInCinema: true,
  kpPopular: true,
  imdbPopular: true,
  kpSeries: true,
  imdbSeries: true,
  ggGamesNew: true,
  ggGamesTop: true,
  tmdbInCinema: false,
  tmdbPopular: false,
  tmdbSeries: false,
};

export const defaultOptions = {
  hidePeerRow: false,
  hideSeedRow: false,
  categoryWordFilter: true,
  contextMenu: true,
  disablePopup: false,
  invertIcon: false,
  tabProxyMode: readTabProxyMode(undefined),
  defineCategory: true,
  rankByReleaseDate: false,
  rankBySeeds: false,
  rankByLeeches: false,
  singleResultTable: false,
  originalPosterName: false,
  kpFolderId: '1',
  explorerSections: sections,
  sorts: [{by: 'quality', direction: 0}],
  trackerListHeight: 200,
  titlePresentation: defaultTitlePresentation,
  repositories: ['https://api.github.com/repos/feverqwe/tSearch/contents/external'],
};
export type ExtensionOptions = typeof defaultOptions;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function assignBooleans<T extends object>(target: T, source: Record<string, unknown>) {
  for (const key of Object.keys(target) as Array<keyof T & string>) {
    if (typeof target[key] === 'boolean' && typeof source[key] === 'boolean') {
      Reflect.set(target, key, source[key]);
    }
  }
}

function normalizeOptions(input: unknown): ExtensionOptions {
  const raw = asRecord(input);
  const options = {...defaultOptions, explorerSections: {...sections}};
  assignBooleans(options, raw);
  options.tabProxyMode = readTabProxyMode(raw.tabProxyMode);
  options.titlePresentation = readTitlePresentation(raw.titlePresentation);
  assignBooleans(options.explorerSections, asRecord(raw.explorerSections));
  if (typeof raw.kpFolderId === 'string') options.kpFolderId = raw.kpFolderId;
  if (typeof raw.trackerListHeight === 'number') options.trackerListHeight = raw.trackerListHeight;
  if (Array.isArray(raw.repositories) && raw.repositories.every((url) => typeof url === 'string')) {
    options.repositories = raw.repositories;
  }
  if (Array.isArray(raw.sorts)) {
    const sorts = raw.sorts.map(asRecord);
    if (
      sorts.every(
        ({by, direction}) =>
          typeof by === 'string' && (direction === undefined || typeof direction === 'number'),
      )
    ) {
      options.sorts = sorts.map(({by, direction}) => ({
        by: String(by),
        direction: Number(direction ?? 0),
      }));
    }
  }
  return options;
}

export async function readOptions() {
  const {options} = await storageGet({options: {} as unknown}, 'sync');
  return normalizeOptions(options);
}

export const optionsQuery = queryOptions({
  queryKey: ['storage', 'sync', 'options'],
  queryFn: readOptions,
});

export type OptionsChange = (options: ExtensionOptions) => ExtensionOptions;

export function saveOptions(change: OptionsChange) {
  return navigator.locks.request('tsearch:options', async () => {
    const options = change(await readOptions());
    await storageSet({options}, 'sync');
    return options;
  });
}

export function useSaveOptions() {
  const client = useQueryClient();
  return useMutation({
    scope: {id: 'options'},
    mutationFn: saveOptions,
    onSuccess: () => client.invalidateQueries({queryKey: optionsQuery.queryKey}),
  });
}
