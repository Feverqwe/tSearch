import {queryOptions} from '@tanstack/react-query';
import {compareVersions} from 'compare-versions';

import {isWebAddress} from '../tools/explorerView';
import getHash from '../tools/getHash';
import {prepareTrackerDefinition} from '../tools/trackerDefinition';

import {type RepositoryFile, catalogFromListings} from './repositoryListing';
import {updateTrackerRecords} from './trackerRecords';

export type {RepositoryFile} from './repositoryListing';

export const repositoryFiles = (repositories: readonly string[]) =>
  queryOptions({
    queryKey: ['tracker-repositories', repositories],
    async queryFn({signal}) {
      const listings = await Promise.allSettled(
        repositories.map(async (repo) => {
          if (!isWebAddress(repo)) throw new Error('Invalid repository address');
          const response = await fetch(repo, {signal});
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data: unknown = await response.json();
          if (!Array.isArray(data)) throw new Error('Invalid repository listing');
          return data.filter(
            (file): file is RepositoryFile =>
              file?.type === 'file' &&
              typeof file.name === 'string' &&
              /\.json$/i.test(file.name) &&
              typeof file.html_url === 'string' &&
              isWebAddress(file.html_url) &&
              typeof file.download_url === 'string' &&
              isWebAddress(file.download_url),
          );
        }),
      );
      signal.throwIfAborted();
      return catalogFromListings(repositories, listings);
    },
  });

export const repositoryTracker = (url: string) =>
  queryOptions({
    queryKey: ['tracker-repository-file', url],
    async queryFn({signal}) {
      if (!isWebAddress(url)) throw new Error('Invalid tracker address');
      const response = await fetch(url, {signal, cache: 'no-cache'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return prepareTrackerDefinition(await response.text(), url);
    },
  });

export function installRepositoryTracker(
  url: string,
  record: ReturnType<typeof prepareTrackerDefinition>,
  installedId?: string,
) {
  const id = installedId ?? getHash(url);
  return updateTrackerRecords((trackers) => {
    const previous = Object.hasOwn(trackers, id) ? trackers[id] : undefined;
    if (previous?.meta.version && compareVersions(record.meta.version, previous.meta.version) < 0) {
      throw new Error('The installed tracker has a newer version');
    }
    trackers[id] = {id, ...record, options: previous?.options};
  });
}
