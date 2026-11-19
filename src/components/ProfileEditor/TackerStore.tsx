import {useQuery} from '@tanstack/react-query';

import {optionsQuery} from '../../data/options';
import {repositoryFiles} from '../../data/repositories';

import TackerStoreItem from './TackerStoreItem';

const message = (key: string) => chrome.i18n.getMessage(key);

export default function TackerStore() {
  const {data: options} = useQuery(optionsQuery);
  const query = useQuery({
    ...repositoryFiles(options?.repositories ?? []),
    enabled: Boolean(options),
  });
  const {data} = query;
  return (
    <>
      {query.isFetching && <p role="status">{message('catalog_loading')}</p>}
      {query.isError && <p role="alert">{message('catalog_unavailable')}</p>}
      {data && data.failures.length > 0 && (
        <div role="alert" className="catalog-errors">
          <p>{message(data.succeeded ? 'catalog_partial' : 'catalog_unavailable')}</p>
          <ul>
            {data.failures.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </div>
      )}
      {data && !data.files.length && !data.failures.length && <p>{message('catalog_empty')}</p>}
      <div className="manager__trackers">
        {data?.files.map((file) => (
          <TackerStoreItem key={file.download_url} file={file} />
        ))}
      </div>
    </>
  );
}
