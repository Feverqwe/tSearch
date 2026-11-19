import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';

import {columns, results, trackerNames} from '../storybook/searchFixtures';

import SearchResultsTable from './SearchResultsTable';

const meta = {
  component: SearchResultsTable,
  title: 'Search/Results table',
  parameters: {layout: 'padded'},
  args: {
    columns,
    results,
    trackerNames,
    sortDirections: {seeds: {direction: 'down', priority: 1}, size: {direction: 'up', priority: 2}},
    onSort: fn(),
    onOpenResult: fn(),
  },
} satisfies Meta<typeof SearchResultsTable>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AllColumns: Story = {
  args: {
    results: results.slice(0, 1).flatMap((row) =>
      [-15, 280, 498, 10500, NaN].map((quality, i) => ({
        ...row,
        quality,
        url: row.url + '/' + i,
      })),
    ),
  },
};
export const Compact: Story = {args: {columns: columns.slice(0, 4), sortDirections: {}}};
export const NoMatchingRows: Story = {args: {results: []}};
