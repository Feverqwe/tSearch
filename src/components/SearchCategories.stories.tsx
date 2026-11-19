import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState, type ComponentProps} from 'react';
import {fn} from 'storybook/test';

import SearchCategories from './SearchCategories';

function CategoryFixture(args: ComponentProps<typeof SearchCategories>) {
  const [selectedId, setSelected] = useState(args.selectedId);
  return (
    <SearchCategories
      {...args}
      selectedId={selectedId}
      onSelect={(id, button) => {
        setSelected(id);
        args.onSelect(id, button);
      }}
    />
  );
}

const meta = {
  component: SearchCategories,
  title: 'Search/Categories',
  args: {
    categories: [
      {label: 'All', count: 13},
      {id: 3, label: 'Films', count: 3},
      {id: 1, label: 'Music', count: 10},
      {id: 2, label: 'Games', count: 0},
    ],
    onSelect: fn(),
  },
  render: (args) => <CategoryFixture {...args} />,
} satisfies Meta<typeof SearchCategories>;
export default meta;

type Story = StoryObj<typeof meta>;
export const WithCounts: Story = {};
export const EmptySelected: Story = {args: {selectedId: 2}};
