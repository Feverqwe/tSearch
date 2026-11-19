import ExtensionDataProvider from './data/ExtensionDataProvider';
import {createRoot} from 'react-dom/client';

import './assets/css/popup.less';
import SearchForm from './components/SearchForm/SearchForm';
import errorTracker from './tools/errorTracker';
import getTitle from './tools/getTitle';

import {initTheme, themedSearch, themeInSearch} from './ui/theme';

initTheme();
document.documentElement.lang = chrome.i18n.getMessage('ui_language');
document.title = getTitle(chrome.i18n.getMessage('settings_search'));
errorTracker.bindExceptions();

function openSearch(query: string) {
  const mode = themeInSearch(location.hash.slice(1).split('?')[1] ?? '');
  const params = themedSearch(query ? `?${new URLSearchParams({query})}` : '', mode);
  const hash = query || params ? `#${query ? '/search' : '/'}${params}` : '';
  void chrome.tabs.create({url: `index.html${hash}`});
}

createRoot(document.getElementById('root')!).render(
  <ExtensionDataProvider>
    <div className="popup-search">
      <SearchForm onSubmit={openSearch} />
    </div>
  </ExtensionDataProvider>,
);
