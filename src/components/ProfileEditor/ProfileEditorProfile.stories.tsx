import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-vite';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {MemoryRouter} from 'react-router-dom';
import {expect} from 'storybook/test';

import ProfileEditorStore from '../../stores/ProfileEditorStore';
import {profileTracker} from '../../stores/ProfileStore';
import RootStore from '../../stores/RootStore';
import {RootContext} from '../../stores/rootContext';

import ProfileEditorProfile from './ProfileEditorProfile';

import '../../assets/css/options.less';

const meta = {
  title: 'Editors/Tracker list',
  component: ProfileEditorProfile,
  render: () => <TrackerListFixture />,
  parameters: {layout: 'padded'},
} satisfies Meta<typeof ProfileEditorProfile>;
export default meta;

function TrackerListFixture() {
  const [client] = useState(() => new QueryClient());
  const [{root, store}] = useState(() => {
    const root = new RootStore();
    const films = {name: 'Open Films'};
    root.trackers.setTrackers({
      booktracker: {id: 'booktracker', code: '', meta: films},
      archive: {id: 'archive', code: '', meta: {name: 'Animation Archive'}},
    });
    const store = new ProfileEditorStore(
      [{id: 'all', name: 'All trackers', trackers: [profileTracker('booktracker', films, true)]}],
      root.trackers,
    );
    return {root, store};
  });
  return (
    <QueryClientProvider client={client}>
      <RootContext.Provider value={root}>
        <MemoryRouter>
          <div className="profile-editor">
            <ProfileEditorProfile
              profileEditorStore={store}
              profileEditorProfileStore={store.profiles[0]}
            />
          </div>
        </MemoryRouter>
      </RootContext.Provider>
    </QueryClientProvider>
  );
}

export const TrackerRequests: StoryObj = {
  play: async ({canvas, userEvent}) => {
    const proxy = canvas.getByRole('checkbox', {name: 'Requests via site tab'});
    await expect(proxy).toBeChecked();
    await userEvent.click(canvas.getByRole('button', {name: /^Installed/}));
    await expect(canvas.getByRole('checkbox', {name: 'Animation Archive'})).toBeVisible();
    await expect(canvas.queryByRole('checkbox', {name: 'Open Films'})).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {name: /^Built-in/}));
    await expect(proxy).toBeChecked();
    await expect(
      canvas.queryByRole('checkbox', {name: 'Animation Archive'}),
    ).not.toBeInTheDocument();
    const search = canvas.getByRole('searchbox', {name: 'Find tracker'});
    await userEvent.type(search, 'Archive');
    await expect(proxy).not.toBeInTheDocument();
    const archive = canvas.getByRole('checkbox', {name: 'Animation Archive'});
    await userEvent.click(archive);
    await expect(proxy).not.toBeChecked();
    await userEvent.click(proxy);
    await userEvent.click(archive);
    await expect(proxy).not.toBeInTheDocument();
    await userEvent.click(archive);
    await expect(proxy).toBeChecked();
  },
};
