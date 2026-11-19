import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-vite';
import {MemoryRouter} from 'react-router-dom';
import {fn} from 'storybook/test';

import ExplorerCard from '../components/Explorer/ExplorerCard';
import ExplorerSectionView from '../components/Explorer/ExplorerSectionView';
import SearchLayout from '../components/SearchLayout';

import {FiltersFixture, HeaderFixture, ProfileFixture} from './searchFixtures';

const meta = {
  title: 'Screens/Home',
  component: SearchLayout,
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

const quickSearch = fn();
const open = fn();

function HomeFixture({loading}: {loading?: boolean}) {
  const [collapsed, setCollapsed] = useState(false);
  const [text, setText] = useState('');

  return (
    <SearchLayout
      header={<HeaderFixture />}
      sidebar={
        <>
          <ProfileFixture />
          <FiltersFixture text={text} onTextChange={setText} />
        </>
      }
    >
      <ul className="explore">
        <ExplorerSectionView
          id="open-films"
          title="Open films"
          collapsed={collapsed}
          loading={loading}
          onToggle={() => setCollapsed((current) => !current)}
        >
          {!loading && (
            <ul className="section__body">
              {['Big Buck Bunny', 'Sintel', 'Tears of Steel'].map((title, index) => (
                <ExplorerCard
                  key={title}
                  title={title}
                  url={'https://example.invalid/films/' + index}
                  zoom={100}
                  onQuickSearch={quickSearch}
                  onOpenResult={open}
                />
              ))}
            </ul>
          )}
        </ExplorerSectionView>
      </ul>
    </SearchLayout>
  );
}

export const Explorer: Story = {render: () => <HomeFixture />};
export const Loading: Story = {render: () => <HomeFixture loading />};
