import type SearchStore from '../stores/SearchStore';
import {RootContext} from '../stores/rootContext';
import {useContext, useState} from 'react';
import {useSaveOptions} from '../data/options';
import {observer} from 'mobx-react-lite';
import ProfileTracker from './ProfileTracker';
import TrackerList from './TrackerList';

import type {ProfileRecord} from '../stores/ProfileStore';
interface ProfileProps {
  searchStore?: SearchStore;
  profileStore: ProfileRecord;
}

const Profile = observer(function Profile({profileStore, searchStore}: ProfileProps) {
  const {optionValues, trackers: trackersStore} = useContext(RootContext);
  const [height, setHeight] = useState(() => Math.max(56, optionValues.trackerListHeight));
  const saveOptions = useSaveOptions().mutate;

  function handleResizeStop(height: number) {
    setHeight(height);
    saveOptions((options) => ({...options, trackerListHeight: height}));
  }
  if (trackersStore.state !== 'done') {
    const isError = trackersStore.state === 'error';
    return (
      <p role={isError ? 'alert' : 'status'}>
        {chrome.i18n.getMessage(isError ? 'trackers_load_error' : 'trackers_loading')}
      </p>
    );
  }

  return (
    <TrackerList height={height} onResize={handleResizeStop}>
      {profileStore.trackers.map((tracker) => (
        <ProfileTracker key={tracker.id} profileTrackerStore={tracker} searchStore={searchStore} />
      ))}
    </TrackerList>
  );
});

export default Profile;
