import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-vite';
import {MemoryRouter} from 'react-router-dom';
import {fn} from 'storybook/test';

import SearchCategories from '../components/SearchCategories';
import SearchLayout from '../components/SearchLayout';
import SearchResultsTable from '../components/SearchResultsTable';
import Button from '../components/ui/Button';

import {
  FiltersFixture,
  HeaderFixture,
  ProfileFixture,
  columns,
  results,
  trackerNames,
} from './searchFixtures';

const meta = {
  component: SearchLayout,
  title: 'Screens/Search',
  parameters: {layout: 'fullscreen'},
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {header: null, sidebar: null, children: null},
} satisfies Meta<typeof SearchLayout>;
export default meta;

type Story = StoryObj<typeof meta>;

const openResult = fn();

function SearchScreen({state}: {state?: 'waiting' | 'empty' | 'more' | 'loading-more'}) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<number>();
  const [sort, setSort] = useState<'up' | 'down'>('down');
  const filtered =
    state === 'empty' || state === 'waiting'
      ? []
      : results.filter(({title}) => title.toLowerCase().includes(text.toLowerCase()));
  const visible = filtered
    .filter(
      (result) =>
        category === undefined || (result.categoryTitle === 'Short films' ? 3 : -1) === category,
    )
    .toSorted((a, b) =>
      sort === 'down' ? (b.seeds ?? 0) - (a.seeds ?? 0) : (a.seeds ?? 0) - (b.seeds ?? 0),
    );
  const films = filtered.filter(({categoryTitle}) => categoryTitle === 'Short films').length;

  return (
    <SearchLayout
      header={<HeaderFixture initialQuery="Blender open movies" pending={state === 'waiting'} />}
      sidebar={
        <>
          <ProfileFixture />
          <FiltersFixture text={text} onTextChange={setText} />
        </>
      }
    >
      {state === 'empty' && (
        <p className="search-status" role="status">
          {chrome.i18n.getMessage('search_empty')}
        </p>
      )}
      {filtered.length > 0 && (
        <>
          <SearchCategories
            categories={[
              {label: 'All', count: filtered.length},
              {id: 3, label: 'Films', count: films},
              {id: -1, label: 'Other', count: filtered.length - films},
            ]}
            selectedId={category}
            onSelect={setCategory}
          />
          <SearchResultsTable
            columns={columns}
            results={visible}
            trackerNames={trackerNames}
            sortDirections={{seeds: {direction: sort, priority: 1}}}
            onSort={(column) => {
              if (column === 'seeds') setSort((current) => (current === 'down' ? 'up' : 'down'));
            }}
            onOpenResult={openResult}
          />
          {(state === 'more' || state === 'loading-more') && (
            <div className="table__footer">
              <Button className="loadMore" busyIndicator="inline" busy={state === 'loading-more'}>
                {chrome.i18n.getMessage('loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </SearchLayout>
  );
}

export const Results: Story = {render: () => <SearchScreen />};
export const NoResults: Story = {render: () => <SearchScreen state="empty" />};

export const WaitingForFirstResponse: Story = {render: () => <SearchScreen state="waiting" />};
export const LoadMore: Story = {render: () => <SearchScreen state="more" />};
export const LoadingMore: Story = {render: () => <SearchScreen state="loading-more" />};
