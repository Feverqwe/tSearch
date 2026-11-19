import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn} from 'storybook/test';

import Button from '../ui/Button';

import ExplorerSectionView from './ExplorerSectionView';
import ExplorerViewSettings from './ExplorerViewSettings';

function Shelf(args: React.ComponentProps<typeof ExplorerSectionView>) {
  const [collapsed, setCollapsed] = useState(Boolean(args.collapsed));
  const [settings, setSettings] = useState(false);
  const [zoom, setZoom] = useState(120);
  const [rows, setRows] = useState(2);
  const [refreshing, setRefreshing] = useState(Boolean(args.loading));
  return (
    <ul className="explore" style={{width: 'min(580px, 80vw)'}}>
      <ExplorerSectionView
        {...args}
        collapsed={collapsed}
        loading={refreshing}
        onToggle={() => setCollapsed(!collapsed)}
        actions={
          <Button
            aria-expanded={settings}
            aria-controls="fixture-settings"
            onClick={() => setSettings(!settings)}
          >
            Customize
          </Button>
        }
        settings={
          <ExplorerViewSettings
            id="fixture-settings"
            hidden={!settings}
            zoom={zoom}
            rows={rows}
            refreshing={refreshing}
            onZoom={setZoom}
            onResetZoom={() => setZoom(100)}
            onRows={setRows}
            onRefresh={() => setRefreshing(true)}
          />
        }
      />
    </ul>
  );
}
const meta = {
  title: 'Explorer/Collection',
  component: ExplorerSectionView,
  args: {id: 'fixture', title: 'Films', onToggle: fn(), children: <p>Example film</p>},
  render: (args) => <Shelf {...args} />,
} satisfies Meta<typeof ExplorerSectionView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {args: {collapsed: true}};
export const RefreshingWithResults: Story = {args: {loading: true}};
export const NeedsSignIn: Story = {args: {loginRequired: true, error: true, children: null}};
export const RefreshError: Story = {args: {error: true}};
export const Empty: Story = {args: {empty: true, children: null}};
export const Customize: Story = {
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Customize'}));
    const slider = canvas.getByRole('slider', {name: 'Poster size'});
    await expect(slider).toBeVisible();
    await userEvent.click(canvas.getByRole('button', {name: 'Reset poster size'}));
    await expect(slider).toHaveValue('100');
    const refresh = canvas.getByRole('button', {name: 'Refresh collection'});
    await userEvent.click(refresh);
    await expect(refresh).toHaveAttribute('aria-busy', 'true');
    await expect(refresh).toHaveFocus();
    await expect(canvas.getByText('Example film')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', {name: 'Films'}));
    await expect(canvas.queryByRole('slider')).not.toBeInTheDocument();
  },
};
