import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState, type ComponentProps} from 'react';
import {MemoryRouter} from 'react-router-dom';
import {fn} from 'storybook/test';

import '../../assets/css/options.less';
import ProfileEditorList from './ProfileEditorList';

const meta = {
  title: 'Editors/Profiles',
  component: ProfileEditorList,
  parameters: {layout: 'padded'},
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="profile-editor">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {profiles: [], handleCreate: fn(), handleSave: fn(), onRemove: fn()},
  render: (args) => <ProfileListFixture {...args} />,
} satisfies Meta<typeof ProfileEditorList>;
export default meta;

type Story = StoryObj<typeof meta>;

function ProfileListFixture(args: ComponentProps<typeof ProfileEditorList>) {
  const [profiles, setProfiles] = useState(args.profiles);
  return (
    <ProfileEditorList
      {...args}
      profiles={profiles}
      handleCreate={() => {
        args.handleCreate();
        setProfiles((current) => [...current, {id: crypto.randomUUID(), name: 'New profile'}]);
      }}
      onRemove={(id) => {
        args.onRemove(id);
        setProfiles((current) => current.filter((profile) => profile.id !== id));
      }}
    />
  );
}

export const SavedProfiles: Story = {
  args: {
    profiles: [
      {id: 'general', name: 'General'},
      {id: 'films', name: 'Open films'},
    ],
  },
};
export const Empty: Story = {};
