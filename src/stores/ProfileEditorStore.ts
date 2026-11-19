import {makeAutoObservable, observableRef, observableShallow, observable, runInAction} from 'mobx';

import builtInTrackers from '../trackers.json';
import TrackerStore, {sendTrackerMessage} from './TrackerStore';
import type TrackersStore from './TrackersStore';
import {profileTracker, type ProfileTracker, type ProfileRecord} from './ProfileStore';
import moveBetween from '../tools/moveBetween';
import getLogger from '../tools/getLogger';
import {profileIdentity} from '../data/profileChanges';

const logger = getLogger('profile editor');
export type ProfileCategory = 'all' | 'withoutList' | 'selected' | 'builtIn' | 'installed';

class ProfileTrackerDraft {
  readonly id: string;
  readonly meta: ProfileTracker['meta'];
  enableProxy: boolean | undefined;
  updateState: 'idle' | 'pending' | 'done' | 'error' = 'idle';

  constructor(tracker: ProfileTracker) {
    this.id = tracker.id;
    this.meta = tracker.meta;
    this.enableProxy = tracker.options.enableProxy;
    makeAutoObservable(this, {id: false, meta: false}, {autoBind: true});
  }

  getIconUrl() {
    return '';
  }

  setEnableProxy(value: boolean) {
    this.enableProxy = value;
  }

  async update() {
    this.updateState = 'pending';
    try {
      await sendTrackerMessage({
        action: 'downloadTracker',
        id: this.id,
        updateURL: this.meta.updateURL,
        downloadURL: this.meta.downloadURL,
      });
      runInAction(() => {
        this.updateState = 'done';
      });
    } catch (error) {
      logger.error('Could not download tracker', this.id, error);
      runInAction(() => {
        this.updateState = 'error';
      });
    }
  }
}

export type ListedTracker = TrackerStore | ProfileTrackerDraft;

export class ProfileEditorProfileStore {
  readonly id: string;
  name: string;
  baseline: ProfileRecord | undefined;
  category: ProfileCategory;
  filterText = '';
  selectedTrackerIds: string[];
  private trackerDrafts = observable.map<string, ProfileTrackerDraft>([], {deep: false});

  constructor(
    profile: ProfileRecord,
    private readonly editor: ProfileEditorStore,
    persisted = true,
  ) {
    this.id = profile.id;
    this.name = profile.name;
    this.baseline = persisted ? profile : undefined;
    this.selectedTrackerIds = profile.trackers.map(({id}) => id);
    this.category = this.selectedTrackerIds.length ? 'selected' : 'all';
    for (const tracker of profile.trackers) {
      this.trackerDrafts.set(tracker.id, new ProfileTrackerDraft(tracker));
    }
    makeAutoObservable<this, 'trackerDrafts' | 'editor'>(
      this,
      {
        id: false,
        editor: false,
        trackerDrafts: false,
        baseline: observableRef,
      },
      {autoBind: true},
    );
  }

  setName(value: string) {
    this.name = value;
  }
  setBaseline(value: ProfileRecord) {
    this.baseline = value;
  }
  get dirty() {
    return profileIdentity(this.toRecord()) !== profileIdentity(this.baseline);
  }
  setCategory(value: ProfileCategory) {
    this.category = value;
  }
  setFilterText(value: string) {
    this.filterText = value;
  }

  addTracker(id: string) {
    if (this.selectedTrackerIds.includes(id)) return;
    const tracker = this.getTrackerById(id);
    if (!tracker) return;
    if (!this.trackerDrafts.has(id)) {
      const mode = isInstalledTracker(tracker) ? tracker.meta.requestMode : undefined;
      this.trackerDrafts.set(
        id,
        new ProfileTrackerDraft(profileTracker(id, tracker.meta, mode && mode === 'tab')),
      );
    }
    this.selectedTrackerIds.push(id);
  }

  removeTracker(id: string) {
    this.selectedTrackerIds = this.selectedTrackerIds.filter((selected) => selected !== id);
  }

  moveTracker(id: string, previous?: string, next?: string) {
    this.selectedTrackerIds = moveBetween(this.selectedTrackerIds, id, previous, next);
  }

  getTrackerById(id: string): ListedTracker | undefined {
    return this.editor.trackers.getTrackerById(id) ?? this.getProfileTracker(id);
  }

  getProfileTracker(id: string) {
    return this.trackerDrafts.get(id);
  }

  get categoryTrackers() {
    return this.getTrackers(this.category);
  }

  getTrackerCountByCategory(category: ProfileCategory) {
    return this.getTrackers(category).length;
  }

  private getTrackers(category: ProfileCategory) {
    let ids: readonly string[] = this.selectedTrackerIds;
    if (category !== 'selected') {
      ids = Array.from(new Set([...ids, ...this.editor.trackers.trackers.keys()]));
      if (category === 'withoutList') {
        const selected = new Set(
          this.editor.profiles.flatMap((profile) => profile.selectedTrackerIds),
        );
        ids = ids.filter((id) => !selected.has(id));
      }
    }
    const trackers = ids
      .map(this.getTrackerById)
      .filter((tracker) => tracker !== undefined)
      .filter((tracker) => {
        if (category === 'builtIn') {
          return isInstalledTracker(tracker) && Object.hasOwn(builtInTrackers, tracker.id);
        }
        if (category === 'installed') {
          return isInstalledTracker(tracker) && !Object.hasOwn(builtInTrackers, tracker.id);
        }
        return true;
      });
    if (!this.filterText) return trackers;
    const term = this.filterText.toLowerCase();
    return trackers.filter(({id, meta}) =>
      [id, ...Object.values(meta)].join(' ').toLowerCase().includes(term),
    );
  }

  toRecord(): ProfileRecord {
    return {
      id: this.id,
      name: this.name,
      trackers: this.selectedTrackerIds.flatMap((id) => {
        const tracker = this.getTrackerById(id);
        return tracker
          ? [profileTracker(id, tracker.meta, this.trackerDrafts.get(id)?.enableProxy)]
          : [];
      }),
    };
  }
}

export default class ProfileEditorStore {
  profiles: ProfileEditorProfileStore[];
  baseline: ProfileRecord[];
  orderBaseline: ProfileRecord[];

  constructor(
    profiles: ProfileRecord[],
    readonly trackers: TrackersStore,
  ) {
    this.baseline = profiles;
    this.orderBaseline = profiles;
    this.profiles = profiles.map((profile) => new ProfileEditorProfileStore(profile, this));
    makeAutoObservable(
      this,
      {
        trackers: false,
        profiles: observableShallow,
        baseline: observableShallow,
        orderBaseline: observableShallow,
      },
      {autoBind: true},
    );
  }

  acceptSaved(profiles: ProfileRecord[], keepId: string) {
    const changedOrder =
      this.profiles.length !== this.baseline.length ||
      this.profiles.some(({id}, index) => this.baseline[index]?.id !== id);
    const previousIds = new Set(this.baseline.map(({id}) => id));
    const saved = new Map(profiles.map((profile) => [profile.id, profile]));
    const savedProfile = saved.get(keepId);
    const order = changedOrder
      ? [
          ...this.profiles.filter(({id}) => saved.has(id) || !previousIds.has(id)),
          ...profiles.filter(({id}) => !previousIds.has(id) && !this.getProfileById(id)),
        ]
      : profiles;
    this.baseline = profiles;
    if (!changedOrder) {
      this.orderBaseline = profiles;
    } else if (savedProfile) {
      // Keep concurrent order and removal conflicts detectable after saving a single profile.
      this.orderBaseline = this.orderBaseline.some(({id}) => id === keepId)
        ? this.orderBaseline.map((profile) => (profile.id === keepId ? savedProfile : profile))
        : [...this.orderBaseline, savedProfile];
    }
    this.profiles = order.map((profile) => {
      const existing = this.getProfileById(profile.id);
      if (existing && profile.id === keepId && savedProfile) {
        existing.setBaseline(savedProfile);
        return existing;
      }
      return existing?.dirty
        ? existing
        : new ProfileEditorProfileStore(saved.get(profile.id)!, this);
    });
  }

  restore(profile: ProfileRecord) {
    this.profiles = this.profiles.map((draft) =>
      draft.id === profile.id ? new ProfileEditorProfileStore(profile, this) : draft,
    );
  }

  reload(profiles: ProfileRecord[]) {
    this.baseline = profiles;
    this.orderBaseline = profiles;
    this.profiles = profiles.map((profile) => new ProfileEditorProfileStore(profile, this));
  }

  getProfileById(id?: string) {
    return this.profiles.find((profile) => profile.id === id);
  }

  moveProfile(id: string, previous?: string, next?: string) {
    const profile = this.getProfileById(id);
    if (profile)
      this.profiles = moveBetween(
        this.profiles,
        profile,
        this.getProfileById(previous),
        this.getProfileById(next),
      );
  }

  removeProfileById(id: string) {
    this.profiles = this.profiles.filter((profile) => profile.id !== id);
  }

  createProfile(id: string) {
    this.profiles.push(new ProfileEditorProfileStore({id, name: 'New', trackers: []}, this, false));
  }
}

export function isInstalledTracker(tracker: ListedTracker): tracker is TrackerStore {
  return tracker instanceof TrackerStore;
}
