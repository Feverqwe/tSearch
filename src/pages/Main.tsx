import {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import QuickSearchStore from '../stores/QuickSearchStore';
import {RootContext} from '../stores/rootContext';
import Header from '../components/Header';
import Profiles from '../components/Profiles';
import ScrollTop from '../components/ScrollTop';
import SearchLayout from '../components/SearchLayout';
import Filters from '../components/Filters';
import Explorer from '../components/Explorer/Explorer';
import getTitle from '../tools/getTitle';

export default observer(function Main() {
  const root = useContext(RootContext);
  const profileId = root.profiles.profile?.id;
  const [quickSearch] = useState(() => new QuickSearchStore(root));
  useLayoutEffect(() => quickSearch.clear, [profileId, quickSearch]);
  const current = quickSearch.current;

  useEffect(() => {
    document.title = getTitle();
  }, []);
  return (
    <SearchLayout
      header={<Header />}
      sidebar={
        <>
          <Profiles searchStore={current?.search} />
          <Filters />
        </>
      }
      footer={<ScrollTop />}
    >
      {quickSearch.state === 'unavailable' && (
        <p className="search-status" role="status">
          {chrome.i18n.getMessage('search_no_trackers')}
        </p>
      )}
      <Explorer quickSearch={quickSearch} />
    </SearchLayout>
  );
});
