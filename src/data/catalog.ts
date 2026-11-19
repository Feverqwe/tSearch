import {queryOptions} from '@tanstack/react-query';

import {type ProfileRecord, defaultProfile, normalizeProfiles} from '../stores/ProfileStore';
import getTrackers from '../tools/getTrackers';
import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';

import {mergeProfileDraft, mergeProfileOrder} from './profileChanges';

export const trackersQuery = queryOptions({
  queryKey: ['storage', 'local', 'trackers'],
  queryFn: getTrackers,
});

async function readProfiles() {
  const {profiles} = await storageGet({profiles: [defaultProfile()] as unknown}, 'sync');
  return normalizeProfiles(profiles);
}

export const profilesQuery = queryOptions({
  queryKey: ['storage', 'sync', 'profiles'],
  queryFn: readProfiles,
});

export function getTabProfile() {
  return sessionStorage.getItem('profileId');
}

export function setTabProfile(profileId: string) {
  sessionStorage.setItem('profileId', profileId);
}

export const initialProfileQuery = queryOptions({
  queryKey: ['initial-profile'],
  async queryFn() {
    const tabProfileId = getTabProfile();
    if (tabProfileId !== null) return tabProfileId;
    const {profileId} = await storageGet({profileId: null as string | null});
    return typeof profileId === 'string' ? profileId : null;
  },
});

export function saveSelectedProfile(profileId: string) {
  setTabProfile(profileId);
  return storageSet({profileId});
}

export function saveProfileDraft(draft: ProfileRecord, baseline?: ProfileRecord) {
  return navigator.locks.request('tsearch:profiles', async () => {
    const profiles = mergeProfileDraft(await readProfiles(), baseline, draft);
    await storageSet({profiles}, 'sync');
    return profiles;
  });
}

export function saveProfileOrder(ids: readonly string[], baseline: readonly ProfileRecord[]) {
  return navigator.locks.request('tsearch:profiles', async () => {
    const profiles = mergeProfileOrder(await readProfiles(), baseline, ids);
    await storageSet({profiles}, 'sync');
    const {profileId} = await storageGet({profileId: null as string | null});
    if (profileId && !profiles.some(({id}) => id === profileId)) {
      await storageSet({profileId: profiles[0]?.id ?? null});
    }
    return profiles;
  });
}
