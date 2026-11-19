import {type ComponentProps, useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-vite';
import {MemoryRouter} from 'react-router-dom';
import {expect, fn} from 'storybook/test';

import IconButton from '../ui/IconButton';

import ExplorerCard from './ExplorerCard';

const sampleResults = [
  {
    title: 'Sintel 1080p',
    url: 'https://example.invalid/item/sintel',
    trackerId: 'open-films',
    size: 752877568,
    quality: 275,
    sizeText: '718 MB',
    label: 'HD',
  },
  {
    title:
      'Sintel (2010) Open Movie film master with full production footage and multilingual subtitles 2160p',
    url: 'https://example.invalid/item/sintel-extended',
    trackerId: 'archive',
    size: 3221225472,
    quality: 515,
    sizeText: '3 GB',
    label: '4K',
  },
];

const meta = {
  title: 'Explorer/Poster card',
  component: ExplorerCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <ul className="section__body">
          <Story />
        </ul>
      </MemoryRouter>
    ),
  ],
  args: {
    title: 'Sintel',
    url: 'https://example.invalid/films/sintel',
    zoom: 100,
    onQuickSearch: fn(),
    onOpenResult: fn(),
  },
} satisfies Meta<typeof ExplorerCard>;
export default meta;

type Story = StoryObj<typeof meta>;

function CardFixture(args: ComponentProps<typeof ExplorerCard>) {
  const [quickRun, setQuickRun] = useState(args.quickRun);
  return (
    <ExplorerCard
      {...args}
      quickRun={quickRun}
      onQuickSearch={() => {
        args.onQuickSearch();
        setQuickRun({id: (quickRun?.id ?? 0) + 1, results: sampleResults});
      }}
    />
  );
}

export const QuickSearch: Story = {
  render: (args) => <CardFixture {...args} />,
  play: async ({canvas, userEvent}) => {
    const button = canvas.getByRole('button', {name: 'Quick search'});
    await userEvent.click(button);
    await expect(canvas.getByRole('link', {name: 'Sintel 1080p'})).toBeVisible();
    await userEvent.tab();
    await expect(canvas.getByRole('link', {name: 'Sintel 1080p'})).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('link', {name: 'Sintel 1080p'})).not.toBeInTheDocument();
    await expect(button).toHaveFocus();
  },
};
export const Collection: Story = {
  args: {actions: <IconButton label="Add to favorites" icon="add-favorite" />},
};

export const BrokenImage: Story = {
  args: {poster: 'data:image/png;base64,AAAA'},
};

export const Favorites: Story = {
  args: {
    actions: (
      <>
        <IconButton label="Remove from favorites" icon="remove-favorite" aria-pressed />
        <IconButton label="Edit" icon="edit" />
        <IconButton label="Move" icon="move" />
      </>
    ),
  },
};

export const Loading: Story = {
  args: {quickRun: {id: 1, pending: true}},
  play: async ({args, canvas, userEvent}) => {
    const button = canvas.getByRole('button', {name: 'Quick search'});
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(args.onQuickSearch).not.toHaveBeenCalled();
  },
};
export const NoMatches: Story = {args: {quickRun: {id: 1, results: []}}};
export const Error: Story = {args: {quickRun: {id: 1}}};
