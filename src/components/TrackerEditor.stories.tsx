import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';

import TrackerEditor from './TrackerEditor';

const meta = {
  component: TrackerEditor,
  title: 'Editors/Tracker',
  parameters: {layout: 'padded'},
  args: {
    labelId: 'fixture-tracker-code',
    onChange: fn(),
    onSave: fn(),
  },
  render: (args) => (
    <>
      <div id={args.labelId}>Tracker code</div>
      <TrackerEditor {...args} />
    </>
  ),
} satisfies Meta<typeof TrackerEditor>;
export default meta;

type Story = StoryObj<typeof meta>;

export const JsonTracker: Story = {
  args: {
    initialValue: JSON.stringify(
      {
        version: 3,
        type: 'kit',
        description: {name: 'Fixture tracker'},
        search: {url: 'https://example.invalid/search?q=%search%'},
        selectors: {
          row: {selector: 'article'},
          title: {selector: 'a', pipeline: [{name: 'getText'}]},
        },
      },
      null,
      2,
    ),
  },
};
