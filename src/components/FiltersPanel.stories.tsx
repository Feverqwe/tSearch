import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {fn} from 'storybook/test';

import FiltersPanel from './FiltersPanel';
import {FiltersFixture} from '../storybook/searchFixtures';

function PanelFixture({showPeers}: {showPeers?: boolean}) {
  const [text, setText] = useState('');
  return <FiltersFixture text={text} onTextChange={setText} showPeers={showPeers} />;
}

const meta = {
  component: FiltersPanel,
  title: 'Search/Filters',
  decorators: [
    (Story) => (
      <div className="content-row">
        <div className="parameter_box">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    text: '',
    onTextChange: fn(),
    size: {min: 0, max: 0, onChange: fn()},
    time: {min: 0, max: 0, preset: 0, onChange: fn()},
  },
} satisfies Meta<typeof FiltersPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AllFilters: Story = {render: () => <PanelFixture />};
export const WithoutPeers: Story = {render: () => <PanelFixture showPeers={false} />};
