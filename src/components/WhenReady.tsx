import {useContext, useEffect, useRef} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  getTabProfile,
  initialProfileQuery,
  profilesQuery,
  setTabProfile,
  trackersQuery,
} from '../data/catalog';
import {qualitySettingsQuery} from '../data/qualitySettings';
import {optionsQuery} from '../data/options';
import {RootContext} from '../stores/rootContext';

export default function WhenReady() {
  const rootStore = useContext(RootContext);
  const {data: options} = useQuery(optionsQuery);
  const quality = useQuery(qualitySettingsQuery);
  useEffect(() => {
    if (options && (quality.data !== undefined || quality.isError)) {
      rootStore.setRuntimeSettings(options, quality.data ?? null);
    }
  }, [options, quality.data, quality.isError, rootStore]);

  const profiles = useQuery(profilesQuery);
  const initialProfile = useQuery(initialProfileQuery);
  const trackers = useQuery(trackersQuery);
  const initializedProfile = useRef(false);

  useEffect(() => {
    if (profiles.isError || initialProfile.isError) {
      rootStore.profiles.setError();
    } else if (profiles.data && initialProfile.data !== undefined) {
      if (!initializedProfile.current) {
        initializedProfile.current = true;
        rootStore.profiles.setProfileId(getTabProfile() ?? initialProfile.data);
      }
      rootStore.profiles.setProfiles(profiles.data);
      const profileId = rootStore.profiles.profile?.id;
      if (profileId !== undefined) setTabProfile(profileId);
    }
  }, [initialProfile.data, initialProfile.isError, profiles.data, profiles.isError, rootStore]);

  useEffect(() => {
    if (trackers.isError) rootStore.trackers.setError();
    else if (trackers.data) rootStore.trackers.setTrackers(trackers.data);
  }, [rootStore, trackers.data, trackers.isError]);

  useEffect(() => {
    rootStore.checkForUpdate();
  }, [rootStore]);
  return null;
}
