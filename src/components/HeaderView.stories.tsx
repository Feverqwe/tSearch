import type {Meta, StoryObj} from '@storybook/react-vite';
import {MemoryRouter} from 'react-router-dom';

import HeaderView from './HeaderView';
import {HeaderFixture} from '../storybook/searchFixtures';

const meta = {
  title: 'Navigation/Header',
  component: HeaderView,
  parameters: {layout: 'fullscreen'},
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {search: null},
} satisfies Meta<typeof HeaderView>;
export default meta;

type Story = StoryObj<typeof meta>;

export const EmptySearch: Story = {render: () => <HeaderFixture />};
export const FilledSearch: Story = {render: () => <HeaderFixture initialQuery="Sintel" />};
