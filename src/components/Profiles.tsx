import type SearchStore from '../stores/SearchStore';
import {RootContext} from '../stores/rootContext';
import {useContext} from 'react';
import {useMutation} from '@tanstack/react-query';
import {saveSelectedProfile} from '../data/catalog';
import {observer} from 'mobx-react-lite';
import Profile from './Profile';
import ProfileSelector from './ProfileSelector';

const Profiles = observer(function Profiles({searchStore}: {searchStore?: SearchStore}) {
  const {profiles: profilesStore} = useContext(RootContext);
  const selectProfile = useMutation({mutationFn: saveSelectedProfile});
  const ready = profilesStore.state === 'done';
  const profile = ready ? profilesStore.profile : undefined;

  return (
    <div className="parameter_box__left">
      <ProfileSelector
        profiles={ready ? profilesStore.profiles : []}
        value={profile?.id ?? ''}
        loading={!ready}
        unavailable={profilesStore.state === 'error'}
        onSelect={(id) => {
          profilesStore.setProfileId(id);
          selectProfile.mutate(id);
        }}
      />
      <div className="parameter parameter-tracker">
        {profile && <Profile key={profile.id} profileStore={profile} searchStore={searchStore} />}
      </div>
    </div>
  );
});

export default Profiles;
