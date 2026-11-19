import {useContext} from 'react';

import {observer} from 'mobx-react-lite';

import {useChangeHistory} from '../data/history';
import type SearchPageStore from '../stores/SearchPageStore';
import type SearchStore from '../stores/SearchStore';
import {RootContext} from '../stores/rootContext';
import {typeSortMap} from '../tools/sortResults';

import SearchCategories from './SearchCategories';
import SearchResultsTable from './SearchResultsTable';

interface SearchPageProps {
  searchStore: SearchStore;
  searchPageStore: SearchPageStore;
  onCategorySelect: (id: number | undefined, button: HTMLButtonElement) => void;
}

export default observer(function SearchPage({
  searchStore,
  searchPageStore,
  onCategorySelect,
}: SearchPageProps) {
  const {trackers, optionValues} = useContext(RootContext);
  const changeHistory = useChangeHistory();
  if (!searchPageStore.filteredResults.length) return null;

  const {columns, sortedAndFilteredResults: results} = searchPageStore;
  const trackerIds = new Set(results.map(({trackerId}) => trackerId));
  const trackerNames = Object.fromEntries(
    [...trackerIds].map((id) => [id, trackers.trackers.get(id)?.meta.name]),
  );
  const trackerIcons = Object.fromEntries(
    [...trackerIds].map((id) => [id, trackers.trackers.get(id)?.getIconUrl()]),
  );
  const categories = categoryList.map(({id, name}) => ({
    id,
    label: chrome.i18n.getMessage(name),
    count: searchPageStore.getVisibleResultCountByCategoryId(id),
  }));
  const sortDirections = Object.fromEntries(
    columns.map((column) => {
      const sort = searchPageStore.getSortBy(column);
      if (!sort) return [column, undefined];
      const descending = sort.direction === 0;
      const reverse = Boolean(typeSortMap[column]?.reverse);
      return [
        column,
        {
          direction: descending !== reverse ? 'down' : 'up',
          priority: searchPageStore.sorts.indexOf(sort) + 1,
        },
      ] as const;
    }),
  );

  return (
    <>
      <SearchCategories
        categories={categories}
        selectedId={searchPageStore.categoryId}
        onSelect={onCategorySelect}
      />
      {results.length === 0 && (
        <p className="search-status" role="status">
          {chrome.i18n.getMessage('search_category_empty')}
        </p>
      )}
      <SearchResultsTable
        columns={columns}
        results={results}
        trackerNames={trackerNames}
        trackerIcons={trackerIcons}
        sortDirections={sortDirections}
        presentation={optionValues.titlePresentation}
        onSort={(column, append) => {
          if (append) searchPageStore.appendSortBy(column);
          else searchPageStore.sortBy(column);
        }}
        onOpenResult={({title, url, trackerId}) =>
          changeHistory({type: 'click', query: searchStore.query, result: {title, url, trackerId}})
        }
      />
    </>
  );
});

const categoryList = [
  {id: undefined, name: 'categoryAll'},
  {id: 3, name: 'categoryFilms'},
  {id: 0, name: 'categorySerials'},
  {id: 7, name: 'categoryAnime'},
  {id: 8, name: 'categoryDocumentary'},
  {id: 11, name: 'categoryHumor'},
  {id: 1, name: 'categoryMusic'},
  {id: 2, name: 'categoryGames'},
  {id: 5, name: 'categoryBooks'},
  {id: 4, name: 'categoryCartoons'},
  {id: 6, name: 'categorySoft'},
  {id: 9, name: 'categorySport'},
  {id: 10, name: 'categoryXXX'},
  {id: -1, name: 'categoryOther'},
];
