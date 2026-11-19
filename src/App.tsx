import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';

import WhenReady from './components/WhenReady';
import ExtensionDataProvider from './data/ExtensionDataProvider';
import ExtensionRoutes from './routes';
import RootStore from './stores/RootStore';
import {RootContext} from './stores/rootContext';
import errorTracker from './tools/errorTracker';
import {RouteTheme} from './ui/ThemeControl';
import {initTheme} from './ui/theme';

import './assets/css/index.less';

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
