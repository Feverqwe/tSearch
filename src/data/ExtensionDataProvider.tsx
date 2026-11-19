import {type ReactNode, useEffect, useState} from 'react';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

export default function ExtensionDataProvider({children}: {children: ReactNode}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {staleTime: Infinity, retry: false, networkMode: 'always'},
          mutations: {networkMode: 'always'},
        },
      }),
  );

  useEffect(() => {
    const onStorageChange: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (
      changes,
      area,
    ) => {
      for (const key of Object.keys(changes)) {
        void client.invalidateQueries({queryKey: ['storage', area, key]});
      }
    };
    chrome.storage.onChanged.addListener(onStorageChange);
    return () => chrome.storage.onChanged.removeListener(onStorageChange);
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
