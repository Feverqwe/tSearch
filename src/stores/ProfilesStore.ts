import {makeAutoObservable, observableRef} from 'mobx';

import {type ProfileRecord, defaultProfile} from './ProfileStore';

export default class ProfilesStore {
  state: 'idle' | 'done' | 'error' = 'idle';
  profiles: ProfileRecord[] = [];
  profileId: string | null = null;
  selectedTrackerIds: string[] = [];

  constructor() {
    makeAutoObservable(this, {profiles: observableRef}, {autoBind: true});
  }

  setProfiles(profiles: ProfileRecord[], profileId = this.profileId) {
    this.profiles = profiles.length ? profiles : [defaultProfile()];
    this.setProfileId(
      this.profiles.some(({id}) => id === profileId) ? profileId : this.profiles[0].id,
    );
    this.state = 'done';
  }

  setProfileId(id: string | null) {
    if (id === this.profileId) return;
    this.profileId = id;
    this.selectedTrackerIds = [];
  }

  addSelectedTracker(id: string) {
    this.selectedTrackerIds.push(id);
  }

  clearSelectedTrackers() {
    this.selectedTrackerIds = [];
  }

  setError() {
    this.state = 'error';
  }

  get profile() {
    return this.profiles.find(({id}) => id === this.profileId) ?? this.profiles[0];
  }

  isSelectedTracker(id: string) {
    return this.selectedTrackerIds.includes(id);
  }

  get prepSelectedTrackerIds() {
    return this.selectedTrackerIds.length
      ? this.selectedTrackerIds
      : (this.profile?.trackers.map(({id}) => id) ?? []);
  }
}
