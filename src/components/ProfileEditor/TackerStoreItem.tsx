import {useContext, useState} from 'react';

import {useMutation, useQuery} from '@tanstack/react-query';
import {observer} from 'mobx-react-lite';

import {
  type RepositoryFile,
  installRepositoryTracker,
  repositoryTracker,
} from '../../data/repositories';
import {type TrackerMeta, removeTrackerRecord} from '../../data/trackerRecords';
import {RootContext} from '../../stores/rootContext';
import getHash from '../../tools/getHash';
import getIconFromMeta from '../../tools/getIconFromMeta';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';

import blankSvg from '../../assets/img/blank.svg';

const message = (key: string) => chrome.i18n.getMessage(key);

export default observer(function TackerStoreItem({file}: {file: RepositoryFile}) {
  const {trackers} = useContext(RootContext);
  const [load, setLoad] = useState(false);
  const url = file.download_url;
  const query = useQuery({...repositoryTracker(url), enabled: load});
  const metadata: TrackerMeta | undefined = query.data?.meta;
  const installed = trackers.getTrackerById(getHash(url)) ?? trackers.getTrackerByDownloadUrl(url);
  const install = useMutation({
    mutationFn: async () => {
      const fresh = await query.refetch();
      if (fresh.isError) throw fresh.error;
      if (!fresh.data) throw new Error('Tracker definition is missing');
      await installRepositoryTracker(url, fresh.data, installed?.id);
    },
  });
  const uninstall = useMutation({mutationFn: removeTrackerRecord});
  const busy = install.isPending || uninstall.isPending;
  const error = uninstall.isError
    ? 'catalog_remove_error'
    : install.isError
      ? installed
        ? 'catalog_install_error'
        : 'catalog_add_error'
      : query.isError
        ? 'catalog_metadata_error'
        : undefined;
  return (
    <div className="tracker-editor-row">
      <img src={(metadata && getIconFromMeta(metadata)) || blankSvg} alt="" />
      <div className="tracker-editor-copy">
        <strong>{metadata?.name || file.name}</strong>
        <small>
          {metadata?.author} {metadata?.version}
        </small>
        {metadata?.description && <p>{metadata.description}</p>}
        {error && <p role="alert">{message(error)}</p>}
      </div>
      <div className="tracker-editor-actions">
        <a
          href={file.html_url}
          className="ts-button ts-icon-button ts-icon-link ts-glyph--website"
          aria-label={message('catalog_open_source_file')}
          target="_blank"
        />
        {metadata && (
          <Button disabled={busy} busy={install.isPending} onClick={() => install.mutate()}>
            {message(installed ? 'update' : 'add')}
          </Button>
        )}
        {installed && (
          <IconButton
            label={message('delete')}
            icon="remove"
            busy={uninstall.isPending}
            disabled={busy}
            onClick={() => uninstall.mutate(installed.id)}
          />
        )}
        {!metadata && (
          <Button
            busy={query.isFetching}
            onClick={() => {
              if (load) void query.refetch();
              else setLoad(true);
            }}
          >
            {message('fetchMeta')}
          </Button>
        )}
      </div>
    </div>
  );
});
