import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';
import type {TrackerRequestMode} from '../tools/tabProxy';
import {readTrackerScriptApprovals} from '../tools/trackerScript';

export interface TrackerMeta {
  name: string;
  version?: string;
  author?: string;
  description?: string;
  homepageURL?: string;
  icon?: string;
  icon64?: string;
  trackerURL?: string;
  updateURL?: string;
  downloadURL?: string;
  supportURL?: string;
  require?: string[];
  connect?: string[];
  requestMode?: TrackerRequestMode;
}

export interface TrackerRecord {
  id: string;
  code: string;
  meta: TrackerMeta;
  options?: {autoUpdate?: boolean; lastUpdate?: number; localOverride?: boolean};
}

export async function readTrackerRecords() {
  const {trackers} = await storageGet({trackers: {} as Record<string, TrackerRecord>});
  return trackers && typeof trackers === 'object' && !Array.isArray(trackers) ? trackers : {};
}

export function updateTrackerRecords(
  change: (trackers: Record<string, TrackerRecord>) => void,
  script?: {id: string; digest?: string},
) {
  return navigator.locks.request('tsearch:trackers', async () => {
    const trackers = await readTrackerRecords();
    change(trackers);
    if (script) {
      const trackerScriptApprovals = await readTrackerScriptApprovals();
      if (script.digest) trackerScriptApprovals[script.id] = script.digest;
      else delete trackerScriptApprovals[script.id];
      await storageSet({trackers, trackerScriptApprovals});
    } else {
      await storageSet({trackers});
    }
  });
}

export function removeTrackerRecord(id: string) {
  return updateTrackerRecords(
    (trackers) => {
      delete trackers[id];
    },
    {id},
  );
}
