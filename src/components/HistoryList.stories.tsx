import {type ComponentProps, useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-vite';
import {MemoryRouter} from 'react-router-dom';
import {expect, fn} from 'storybook/test';

import HistoryList from './HistoryList';

const url = 'https://example.invalid/item/bunny';
const time = 1794733200;
const meta = {
  title: 'History/Search history',
  component: HistoryList,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="main history-ctr">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {change: fn(), entries: []},
} satisfies Meta<typeof HistoryList>;
export default meta;

type Story = StoryObj<typeof meta>;

function HistoryFixture(args: ComponentProps<typeof HistoryList>) {
  const [entries, setEntries] = useState(args.entries);
  return (
    <HistoryList
      entries={entries}
      change={(change) => {
        args.change(change);
        if (change.type === 'remove-query') {
          setEntries((current) => current.filter(({query}) => query !== change.query));
        } else if (change.type === 'remove-click') {
          setEntries((current) =>
            current.map((entry) =>
              entry.query === change.query
                ? {
                    ...entry,
                    clicks: Object.fromEntries(
                      Object.entries(entry.clicks).filter(([url]) => url !== change.url),
                    ),
                  }
                : entry,
            ),
          );
        }
      }}
    />
  );
}

export const WithVisitedResult: Story = {
  render: (args) => <HistoryFixture {...args} />,
  play: async ({canvas, userEvent}) => {
    const button = canvas.getByRole('button', {name: 'Delete: Big Buck Bunny 1080p'});
    await button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.queryByRole('link', {name: 'Big Buck Bunny 1080p'}),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('link', {name: 'Sintel'})).toHaveFocus();
  },
  args: {
    entries: [
      {
        query: 'Big Buck Bunny',
        count: 2,
        time,
        clicks: {[url]: {url, title: 'Big Buck Bunny 1080p', time, trackerId: 'open-films'}},
      },
      {query: 'Sintel', count: 1, time: time - 3600, clicks: {}},
    ],
  },
};
export const Empty: Story = {};
