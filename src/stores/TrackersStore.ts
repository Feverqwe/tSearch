import {makeAutoObservable, observable} from 'mobx';

import type {TrackerRecord} from '../data/trackerRecords';
import TrackerStore from './TrackerStore';

export default class TrackersStore {
  state: 'idle' | 'done' | 'error' = 'idle';
  trackers = observable.map<string, TrackerStore>([], {deep: false});

  constructor() {
    makeAutoObservable(this, {trackers: false}, {autoBind: true});
  }

  setTrackers(records: Record<string, TrackerRecord>) {
    const entries = Object.entries(records).filter(
      ([, record]) => typeof record?.meta?.name === 'string' && typeof record.code === 'string',
    );
    const incoming = new Set(entries.map(([id]) => id));
    for (const id of this.trackers.keys()) {
      if (!incoming.has(id)) {
        this.trackers.get(id)?.dispose();
        this.trackers.delete(id);
      }
    }
    for (const [id, record] of entries) {
      const existing = this.trackers.get(id);
      if (existing) existing.reconcile({...record, id});
      else this.trackers.set(id, new TrackerStore({...record, id}));
    }
    this.state = 'done';
  }

  setError() {
    this.state = 'error';
  }

  getTrackerById(id: string) {
    return this.trackers.get(id);
  }

  getTrackerByDownloadUrl(url: string) {
    return Array.from(this.trackers.values()).find(
      ({meta}) => meta.downloadURL === url || meta.updateURL === url,
    );
  }
}
