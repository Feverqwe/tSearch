import {useEffect} from 'react';

import Header from '../components/Header';
import getTitle from '../tools/getTitle';
import {RouteLink} from '../ui/navigation';

export default function NotFound() {
  const title = chrome.i18n.getMessage('page_not_found');
  useEffect(() => {
    document.title = getTitle(title);
  }, [title]);

  return (
    <div className="page-ctr">
      <Header />
      <main className="not-found">
        <h1>{title}</h1>
        <RouteLink to="/">{chrome.i18n.getMessage('main')}</RouteLink>
      </main>
    </div>
  );
}
