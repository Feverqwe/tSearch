import {type ComponentProps, useRef, useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-vite';
import {MemoryRouter, Route, Routes, useParams} from 'react-router-dom';
import {expect, fn} from 'storybook/test';

import {defaultOptions} from '../data/options';

import OptionsPanel from './OptionsPanel';

const meta = {
  title: 'Screens/Options',
  component: OptionsPanel,
  parameters: {layout: 'fullscreen'},
  args: {
    options: defaultOptions,
    update: fn(),
    backup: {
      exportArchive: async () => {},
      inspectArchive: async () => ({local: {history: {}}, sync: {options: {}}, skipped: []}),
      restoreArchive: async () => {},
    },
  },
  render: (args) => (
    <MemoryRouter initialEntries={['/options/' + args.page]}>
      <Routes>
        <Route path="/options/:page" element={<OptionsFixture {...args} />} />
      </Routes>
    </MemoryRouter>
  ),
} satisfies Meta<typeof OptionsPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

function OptionsFixture(args: ComponentProps<typeof OptionsPanel>) {
  const {page} = useParams();
  const [options, setOptions] = useState(args.options);
  const latest = useRef(options);
  return (
    <OptionsPanel
      {...args}
      page={page}
      options={options}
      update={async (change) => {
        const next = change(latest.current);
        latest.current = next;
        setOptions(next);
        return next;
      }}
    />
  );
}

export const General: Story = {args: {page: 'main'}};
export const Explorer: Story = {args: {page: 'explorer'}};
export const Backup: Story = {args: {page: 'backup'}};

export const Titles: Story = {
  args: {page: 'titles'},
  play: async ({canvas, userEvent}) => {
    await expect(canvas.getByText('Search query: “Sintel”')).toBeVisible();
    const square = canvas.getByRole('combobox', {name: 'Square brackets'});
    await userEvent.selectOptions(square, 'accent');
    await expect(square).toHaveValue('accent');
  },
};
