import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';

import {trackers} from '../storybook/searchFixtures';

import TrackerRow from './TrackerRow';

const meta = {
  component: TrackerRow,
  title: 'Search/Tracker row',
  decorators: [
    (Story) => (
      <div className="parameter_box">
        <Story />
      </div>
    ),
  ],
  args: {
    ...trackers[0],
    id: trackers[0].id,
    name: trackers[0].name,
    onSelect: fn(),
  },
} satisfies Meta<typeof TrackerRow>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Selected: Story = {args: {selected: true}};
export const FilteredCount: Story = {args: trackers[1]};
export const LoginRequired: Story = {args: {...trackers[2], onRetry: fn()}};
export const Loading: Story = {args: trackers[3]};
export const Error: Story = {
  args: {...trackers[4], errorMessage: 'Request failed with status 503', onRetry: fn()},
};
export const Missing: Story = {args: trackers[5]};
