import type {Meta, StoryObj} from '@storybook/react-vite';
import {MemoryRouter} from 'react-router-dom';
import {fn} from 'storybook/test';

import ProfileSelector from './ProfileSelector';
import {ProfileFixture} from '../storybook/searchFixtures';

const meta = {
  component: ProfileSelector,
  title: 'Search/Profiles and trackers',
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="content-row">
          <div className="parameter_box">
            <Story />
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
  args: {profiles: [], value: '', onSelect: fn()},
} satisfies Meta<typeof ProfileSelector>;
export default meta;

type Story = StoryObj<typeof meta>;

export const WithTrackers: Story = {render: () => <ProfileFixture />};
export const Loading: Story = {args: {loading: true}};
