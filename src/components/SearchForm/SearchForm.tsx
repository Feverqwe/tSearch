import {useState} from 'react';

import {useQuery} from '@tanstack/react-query';

import {historyQuery} from '../../data/history';
import {StatusCodeError} from '../../tools/errors';

import SearchInput from './SearchInput';

interface SearchFormProps {
  initialQuery?: string;
  pending?: boolean;
  onSubmit: (query: string) => void;
}

export default function SearchForm({initialQuery = '', pending, onSubmit}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [requested, setRequested] = useState<string | null>(null);
  const {data: history} = useQuery(historyQuery);
  const {data: remote} = useQuery({
    queryKey: ['search-suggestions', requested],
    queryFn: ({signal}) => fetchSuggestions(requested ?? '', signal),
    enabled: Boolean(requested),
    staleTime: 60_000,
  });

  const suggestions =
    requested === ''
      ? Object.values(history ?? {})
          .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
          .map(({query}) => query)
          .filter(Boolean)
      : requested === null
        ? []
        : (remote ?? []);

  return (
    <SearchInput
      query={query}
      pendingQuery={pending ? initialQuery : undefined}
      suggestions={suggestions}
      onChange={setQuery}
      onSubmit={onSubmit}
      onRequestSuggestions={setRequested}
      onClearSuggestions={() => setRequested(null)}
    />
  );
}

async function fetchSuggestions(query: string, signal: AbortSignal): Promise<string[]> {
  const params = new URLSearchParams({client: 'firefox', q: query});
  const response = await fetch(`https://suggestqueries.google.com/complete/search?${params}`, {
    signal,
  });
  if (!response.ok) throw new StatusCodeError(response.status, null, null, response);
  const body = await response.json();
  return Array.isArray(body?.[1])
    ? body[1].filter((value: unknown): value is string => typeof value === 'string')
    : [];
}
