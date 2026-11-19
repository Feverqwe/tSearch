import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

import BackupPanel from './BackupPanel';

const meta = {
  title: 'Settings/Backups',
  component: BackupPanel,
  args: {
    exportArchive: async () => {},
    inspectArchive: async () => ({
      local: {history: {}},
      sync: {options: {}},
      skipped: ['local/unknown.json'],
    }),
    restoreArchive: async () => {},
  },
} satisfies Meta<typeof BackupPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ReviewBeforeRestore: Story = {
  play: async ({canvasElement, userEvent}) => {
    const document = canvasElement.ownerDocument;
    const file = canvasElement.querySelector<HTMLInputElement>('input[type=file]')!;
    await userEvent.upload(file, new File(['sample'], 'tsearch.zip', {type: 'application/zip'}));
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toHaveTextContent('Search history');
    await expect(dialog).toHaveTextContent('Extension settings');
  },
};

export const ExportError: Story = {
  args: {
    exportArchive: async () => {
      throw new Error('Sample failure');
    },
  },
  globals: {theme: 'dark'},
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: /export.*zip/i}));
    await expect(await canvas.findByRole('alert')).toBeVisible();
  },
};
