import ExtensionDataProvider from './data/ExtensionDataProvider';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import {RootContext} from './stores/rootContext';

import RootStore from './stores/RootStore';
import ExtensionRoutes from './routes';
import './assets/css/index.less';
import errorTracker from './tools/errorTracker';
import WhenReady from './components/WhenReady';

import {initTheme} from './ui/theme';
import {RouteTheme} from './ui/ThemeControl';

initTheme();
document.documentElement.lang = chrome.i18n.getMessage('ui_language');
errorTracker.bindExceptions();

const rootStore = new RootStore();

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <RouteTheme />
    <ExtensionDataProvider>
      <RootContext.Provider value={rootStore}>
        <ExtensionRoutes />
        <WhenReady />
      </RootContext.Provider>
    </ExtensionDataProvider>
  </HashRouter>,
);
