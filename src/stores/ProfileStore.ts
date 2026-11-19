import type {TrackerMeta} from '../data/trackerRecords';

type ProfileTrackerMeta = Pick<
  Partial<TrackerMeta>,
  'name' | 'author' | 'homepageURL' | 'trackerURL' | 'updateURL' | 'downloadURL'
>;

export interface ProfileTracker {
  id: string;
  meta: ProfileTrackerMeta;
  options: {enableProxy?: boolean};
}

export interface ProfileRecord {
  id: string;
  name: string;
  trackers: ProfileTracker[];
}

export function profileTracker(
  id: string,
  meta: ProfileTrackerMeta = {},
  enableProxy?: boolean,
): ProfileTracker {
  const {name, author, homepageURL, trackerURL, updateURL, downloadURL} = meta;
  return {
    id,
    meta: {name, author, homepageURL, trackerURL, updateURL, downloadURL},
    options: typeof enableProxy === 'boolean' ? {enableProxy} : {},
  };
}

export function normalizeProfiles(input: unknown): ProfileRecord[] {
  if (!Array.isArray(input)) return [];
  const profiles: ProfileRecord[] = [];
  for (const profile of input) {
    if (!profile || typeof profile.id !== 'string' || typeof profile.name !== 'string') continue;
    const trackers: ProfileTracker[] = [];
    if (Array.isArray(profile.trackers)) {
      for (const tracker of profile.trackers) {
        if (!tracker || typeof tracker.id !== 'string') continue;
        const meta: ProfileTrackerMeta = {};
        for (const key of [
          'name',
          'author',
          'homepageURL',
          'trackerURL',
          'updateURL',
          'downloadURL',
        ] as const) {
          if (typeof tracker.meta?.[key] === 'string') meta[key] = tracker.meta[key];
        }
        trackers.push(profileTracker(tracker.id, meta, tracker.options?.enableProxy));
      }
    }
    profiles.push({
      id: profile.id,
      name: profile.name,
      trackers:
        profile.id === 'default' ? trackers.filter(({id}) => !retiredDefaults.has(id)) : trackers,
    });
  }
  return profiles;
}

const retiredDefaults = new Set(['tfile', 'opentorrent']);

export function defaultProfile(): ProfileRecord {
  return {
    id: 'default',
    name: 'Default',
    trackers: ['rutracker', 'nnmclub', 'kinozal', 'rutor'].map((id) => profileTracker(id)),
  };
}
