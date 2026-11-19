import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {expect, within} from 'storybook/test';

import QualityEditor, {type QualityEditorProps} from './QualityEditor';
import {defaults} from '../tools/qualityConfig';

const fixture: QualityEditorProps['saved'] = {
  ...defaults,
  rules: [
    {title: 'Blu-ray', patterns: [{text: 'Blu-ray'}], weights: [{criterion: 'video', points: 20}]},
    {title: 'FLAC', patterns: [{text: 'FLAC'}], weights: [{criterion: 'audio', points: 5.5}]},
  ],
};

function QualityFixture(args: QualityEditorProps) {
  const [saved, setSaved] = useState(args.saved);
  const [revision, setRevision] = useState('fixture');
  return (
    <div className="options-ctr" style={{display: 'block'}}>
      <QualityEditor
        {...args}
        saved={saved}
        revision={revision}
        onSave={async (value) => {
          setSaved(value);
          setRevision('updated');
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Settings/Quality scoring',
  component: QualityEditor,
  render: (args) => <QualityFixture {...args} />,
  args: {saved: fixture, revision: 'fixture', onSave: async () => {}},
  parameters: {layout: 'fullscreen'},
} satisfies Meta<typeof QualityEditor>;
export default meta;

type Story = StoryObj<typeof meta>;

export const DraftImport: Story = {
  play: async ({canvas, canvasElement, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Import and export JSON'}));
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
    const item = within(dialog);
    const apply = item.getByRole('button', {name: 'Apply to draft'});
    await expect(apply).toBeDisabled();
    await userEvent.paste('{"version":1,"seedPoints":-1.5}');
    await userEvent.click(item.getByRole('button', {name: 'Check JSON'}));
    await expect(apply).toBeEnabled();
    await userEvent.click(apply);
    await expect(canvas.getByRole('spinbutton', {name: 'Seeder points'})).toHaveValue(-1.5);
    await userEvent.click(canvas.getByRole('button', {name: /^Save$/}));
    await expect(canvas.getByRole('button', {name: /^Save$/})).toBeDisabled();
  },
};

export const InvalidRule: Story = {
  globals: {theme: 'dark'},
  play: async ({canvas, canvasElement, userEvent}) => {
    await userEvent.click(canvas.getByRole('button', {name: 'Add rule'}));
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', {name: 'Apply to draft'}));
    await expect(within(dialog).getByLabelText('Word or pattern')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

export const SavedRules: Story = {};

export const EditedRule: Story = {
  play: async ({canvas, userEvent}) => {
    await userEvent.type(canvas.getByRole('searchbox', {name: 'Find rules'}), 'FLAC');
    await expect(canvas.queryByRole('button', {name: 'Blu-ray'})).not.toBeInTheDocument();
    const weight = canvas.getByRole('spinbutton', {name: /FLAC/});
    await userEvent.clear(weight);
    await userEvent.type(weight, '9');
    await expect(canvas.getByRole('button', {name: 'Save'})).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', {name: 'Cancel'}));
    await expect(weight).toHaveValue(5.5);
  },
};
