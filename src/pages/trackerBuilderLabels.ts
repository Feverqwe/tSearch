import type {SelectorId} from '../components/selectorTypes';

export const message = (key: string, values?: string[]) => chrome.i18n.getMessage(key, values);

export const selectorLabels: Record<SelectorId, string> = {
  row: 'kitRowSelector',
  title: 'kitTorrentTitle',
  url: 'kitTorrentLink',
  size: 'kitTorrentSize',
  downloadUrl: 'kitTorrentDownloadLink',
  seeds: 'kitSeedCount',
  peers: 'kitPeerCount',
  date: 'kitAddTime',
  nextPageUrl: 'kitNextPageLink',
  categoryTitle: 'kitCategoryName',
  categoryUrl: 'kitCategoryLink',
  loginForm: 'kitLoginFormSelector',
};
