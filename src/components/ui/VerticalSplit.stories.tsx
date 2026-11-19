import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent} from 'storybook/test';

import VerticalSplit from './VerticalSplit';

const meta = {
  title: 'Editors/Preview divider',
  component: VerticalSplit,
  args: {
    top: <div style={{padding: 12}}>Tracker form</div>,
    bottom: <div style={{padding: 12}}>Example tracker page</div>,
    initialTopPercent: 52,
    separatorLabel: 'Resize form and preview',
    onResize: fn(),
  },
  render: (args) => (
    <div style={{height: 420, width: 'min(840px, 90vw)', display: 'flex'}}>
      <VerticalSplit {...args} />
    </div>
  ),
} satisfies Meta<typeof VerticalSplit>;
export default meta;

export const Adjustable: StoryObj<typeof meta> = {
  play: async ({canvas, args}) => {
    const handle = canvas.getByRole('separator');
    await handle.focus();
    const initial = handle.getAttribute('aria-valuenow');
    await userEvent.keyboard('{ArrowDown}');
    await expect(handle).not.toHaveAttribute('aria-valuenow', initial);
    await expect(args.onResize).toHaveBeenCalled();
  },
};

export const SideBySide: StoryObj<typeof meta> = {
  args: {orientation: 'horizontal'},
  globals: {theme: 'dark'},
  play: async ({canvas, args}) => {
    const handle = canvas.getByRole('separator', {name: 'Resize form and preview'});
    await handle.focus();
    const initial = handle.getAttribute('aria-valuenow');
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).not.toHaveAttribute('aria-valuenow', initial);
    await expect(args.onResize).toHaveBeenCalled();
  },
};
