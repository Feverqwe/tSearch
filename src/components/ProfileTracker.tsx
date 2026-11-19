import {useContext, useEffect} from 'react';

import {observer} from 'mobx-react-lite';

import type {ProfileTracker as ProfileTrackerRecord} from '../stores/ProfileStore';
import type SearchStore from '../stores/SearchStore';
import type TrackerStore from '../stores/TrackerStore';
import {RootContext} from '../stores/rootContext';

import TrackerRow from './TrackerRow';

import blankSvg from '../assets/img/blank.svg';

interface ProfileTrackerProps {
  profileTrackerStore: ProfileTrackerRecord;
  searchStore?: SearchStore;
}
interface TrackerProps {
  trackerStore: TrackerStore;
  profileTrackerStore: ProfileTrackerRecord;
  searchStore?: SearchStore;
}

const ProfileTracker = observer(function ProfileTracker({
  profileTrackerStore,
  searchStore,
}: ProfileTrackerProps) {
  const {trackers} = useContext(RootContext);
  const tracker = trackers.getTrackerById(profileTrackerStore.id);
  if (!tracker) {
    const name = profileTrackerStore.meta.name || 'Not found';
    return <TrackerRow id={profileTrackerStore.id} name={name} status="missing" />;
  }

  return (
    <Tracker
      profileTrackerStore={profileTrackerStore}
      trackerStore={tracker}
      searchStore={searchStore}
    />
  );
});

const Tracker = observer(function Tracker({
  trackerStore: tracker,
  profileTrackerStore,
  searchStore,
}: TrackerProps) {
  const root = useContext(RootContext);
  const trackerSearchStore = searchStore?.trackerSearch.get(tracker.id);

  useEffect(() => {
    tracker.attach();
    tracker.setProfileOptions(profileTrackerStore.options);
    return () => tracker.deattach();
  }, [profileTrackerStore, tracker]);

  function handleClick() {
    const wasSelected = root.profiles.isSelectedTracker(tracker.id);
    root.profiles.clearSelectedTrackers();
    if (!wasSelected) root.profiles.addSelectedTracker(tracker.id);
  }

  const authRequired = trackerSearchStore?.authRequired;
  let status: 'idle' | 'loading' | 'error' = 'idle';
  if (trackerSearchStore?.state === 'pending') status = 'loading';
  else if (!authRequired && trackerSearchStore?.state === 'error') status = 'error';

  let countText: string | undefined;
  if (searchStore && trackerSearchStore && !authRequired) {
    const count = searchStore.getResultCountByTrackerId(tracker.id);
    const visibleCount = searchStore.getVisibleResultCountByTrackerId(tracker.id);
    countText = count === visibleCount ? String(count) : visibleCount + '/' + count;
  }

  const httpStatus = trackerSearchStore?.httpStatus;
  const errorMessage = httpStatus
    ? chrome.i18n.getMessage('tracker_http_error', [String(httpStatus)])
    : trackerSearchStore?.errorMessage;

  return (
    <TrackerRow
      id={tracker.id}
      name={tracker.meta.name}
      siteUrl={tracker.meta.trackerURL}
      iconUrl={tracker.getIconUrl() || blankSvg}
      selected={root.profiles.isSelectedTracker(tracker.id)}
      status={status}
      login={authRequired ? {url: authRequired.url ?? undefined} : undefined}
      errorMessage={errorMessage}
      count={countText}
      onSelect={handleClick}
      onRetry={searchStore ? () => void searchStore.retryTracker(tracker.id) : undefined}
    />
  );
});

export default ProfileTracker;
