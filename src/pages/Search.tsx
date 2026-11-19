import {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {useQuery} from '@tanstack/react-query';
import {observer} from 'mobx-react-lite';

import Filters from '../components/Filters';
import Header from '../components/Header';
import Profiles from '../components/Profiles';
import ScrollTop from '../components/ScrollTop';
import SearchLayout from '../components/SearchLayout';
import SearchPage from '../components/SearchPage';
import Button from '../components/ui/Button';
import {useChangeHistory} from '../data/history';
import {optionsQuery} from '../data/options';
import type SearchStore from '../stores/SearchStore';
import {RootContext} from '../stores/rootContext';
import getTitle from '../tools/getTitle';

export default observer(function Search({query}: {query: string}) {
  const root = useContext(RootContext);
  const {isError} = useQuery(optionsQuery);
  const changeHistory = useChangeHistory();
  const [session, setSession] = useState<{profileId: string; search: SearchStore}>();

  useEffect(() => {
    document.title = getTitle(JSON.stringify(query));
  }, [query]);

  const profileId = root.searchReady ? root.profiles.profile?.id : undefined;
  const failed = isError || root.profiles.state === 'error' || root.trackers.state === 'error';

  useEffect(() => {
    if (profileId === undefined) return;
    const search = root.createSearch(query);
    setSession({profileId, search});
    void search.search();
    changeHistory({type: 'search', query});
    return () => root.destroySearch(search.id);
  }, [changeHistory, profileId, query, root]);

  const search =
    session?.profileId === profileId && session?.search.query === query
      ? session.search
      : undefined;
  return (
    <SearchLayout
      header={<Header searchPending={search?.waitingForFirstResponse} />}
      sidebar={
        <>
          <Profiles searchStore={search} />
          <Filters />
        </>
      }
      footer={<ScrollTop />}
    >
      {search ? (
        <SearchResults key={search.id} search={search} />
      ) : (
        <SearchStatus
          error={failed}
          message={failed ? 'search_prepare_error' : 'search_preparing'}
        />
      )}
    </SearchLayout>
  );
});

const SearchResults = observer(function SearchResults({search}: {search: SearchStore}) {
  const {filters, profiles} = useContext(RootContext);
  const more = useRef<HTMLButtonElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<{button: HTMLButtonElement; links: Set<HTMLAnchorElement>}>(null);
  const categoryAnchor = useRef<{button: HTMLButtonElement; top: number}>(null);
  const categoryId = search.categoryId;
  const loadingMore = search.loadingMore;

  function selectCategory(id: number | undefined, button: HTMLButtonElement) {
    if (id === categoryId) return;
    categoryAnchor.current = {button, top: button.getBoundingClientRect().top};
    search.setCategoryId(id);
  }

  useLayoutEffect(() => {
    const anchor = categoryAnchor.current;
    categoryAnchor.current = null;
    if (anchor?.button.isConnected) {
      const offset = anchor.button.getBoundingClientRect().top - anchor.top;
      if (offset) window.scrollBy({top: offset, behavior: 'instant'});
    }
  }, [categoryId]);

  useLayoutEffect(() => {
    if (loadingMore || !restoreFocus.current) return;
    const {button, links} = restoreFocus.current;
    restoreFocus.current = null;
    if (
      document.activeElement !== button &&
      (button.isConnected || document.activeElement !== document.body)
    )
      return;

    const currentLinks = Array.from(
      results.current?.querySelectorAll<HTMLAnchorElement>('a.title') ?? [],
    );
    const firstAdded = currentLinks.find((link) => !links.has(link));
    (more.current ?? firstAdded ?? currentLinks.at(-1) ?? results.current)?.focus();
  }, [loadingMore]);

  const total = search.pages.reduce((sum, page) => sum + page.results.length, 0);
  const visible = search.pages.reduce((sum, page) => sum + page.filteredResults.length, 0);
  const finished = search.state === 'done' || search.state === 'error';
  return (
    <>
      {finished && search.trackerSearch.size === 0 && <SearchStatus message="search_no_trackers" />}
      {finished && visible === 0 && search.hasSuccessfulResponse && (
        <div>
          <SearchStatus message={total > 0 ? 'search_filtered' : 'search_empty'} />
          {total > 0 && (
            <Button
              onClick={() => {
                filters.reset();
                profiles.clearSelectedTrackers();
              }}
            >
              {chrome.i18n.getMessage('search_reset_filters')}
            </Button>
          )}
        </div>
      )}
      <div ref={results} tabIndex={-1}>
        {search.pages.map((page, index) => (
          <SearchPage
            key={index}
            searchStore={search}
            searchPageStore={page}
            onCategorySelect={selectCategory}
          />
        ))}
      </div>
      {(loadingMore || (finished && search.hasNextQuery)) && (
        <div className="table__footer">
          <Button
            className="loadMore"
            ref={more}
            busy={loadingMore}
            busyIndicator="inline"
            onClick={(event) => {
              const button = event.currentTarget;
              if (document.activeElement === button) {
                restoreFocus.current = {
                  button,
                  links: new Set(results.current?.querySelectorAll<HTMLAnchorElement>('a.title')),
                };
              }
              void search.searchNext();
            }}
          >
            {chrome.i18n.getMessage('loadMore')}
          </Button>
        </div>
      )}
    </>
  );
});

function SearchStatus({message, error}: {message: string; error?: boolean}) {
  return (
    <p
      className={error ? 'search-status search-status--error' : 'search-status'}
      role={error ? 'alert' : 'status'}
    >
      {chrome.i18n.getMessage(message)}
    </p>
  );
}
