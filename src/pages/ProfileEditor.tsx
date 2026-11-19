import {useContext, useEffect, useState} from 'react';

import {useQuery} from '@tanstack/react-query';
import {observer} from 'mobx-react-lite';

import ProfileEditorProfile from '../components/ProfileEditor/ProfileEditorProfile';
import ProfileEditorProfiles from '../components/ProfileEditor/ProfileEditorProfiles';
import {profilesQuery} from '../data/catalog';
import ProfileEditorStore from '../stores/ProfileEditorStore';
import type {ProfileRecord} from '../stores/ProfileStore';
import {RootContext} from '../stores/rootContext';
import {RouteRedirect, useRouteNavigate} from '../ui/navigation';
import {profileRoute} from '../ui/profileRoutes';

const message = (key: string) => chrome.i18n.getMessage(key);

export default observer(function ProfileEditor({id}: {id?: string}) {
  const {trackers} = useContext(RootContext);
  const profiles = useQuery(profilesQuery);
  if (!profiles.data || trackers.state !== 'done') {
    const failed = profiles.isError || trackers.state === 'error';
    return (
      <p role={failed ? 'alert' : 'status'}>
        {message(failed ? 'search_prepare_error' : 'search_preparing')}
      </p>
    );
  }
  return <ProfileWorkspace id={id} latest={profiles.data} />;
});

const ProfileWorkspace = observer(function ProfileWorkspace({
  id,
  latest,
}: {
  id?: string;
  latest: ProfileRecord[];
}) {
  const {trackers} = useContext(RootContext);
  const [store] = useState(() => new ProfileEditorStore(latest, trackers));
  const [missing, setMissing] = useState(false);
  const navigate = useRouteNavigate();
  const profile = store.getProfileById(id);
  const wasSaved = store.baseline.some((item) => item.id === id);
  const removed = Boolean(
    id &&
    ((!profile && !latest.some((item) => item.id === id)) ||
      (wasSaved && !latest.some((item) => item.id === id))),
  );
  useEffect(() => {
    if (removed) {
      setMissing(true);
      store.reload(latest);
      void navigate(profileRoute(), {replace: true});
    } else if (id && !profile && latest.some((item) => item.id === id)) {
      store.reload(latest);
    }
  }, [id, latest, navigate, profile, removed, store]);

  if (removed) return <p role="status">{message('profile_missing')}</p>;
  if (id && !profile) return <RouteRedirect to={profileRoute()} replace />;
  return (
    <section className="settings-group profile-editor-panel">
      <h2>{message(profile ? (wasSaved ? 'profile_edit' : 'newProfile') : 'profile')}</h2>
      {missing && !id && <p role="status">{message('profile_missing')}</p>}
      {profile ? (
        <ProfileEditorProfile
          key={profile.id}
          profileEditorStore={store}
          profileEditorProfileStore={profile}
        />
      ) : (
        <ProfileEditorProfiles profileEditorStore={store} />
      )}
    </section>
  );
});
