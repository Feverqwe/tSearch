import {makeAutoObservable, observable, observableRef} from 'mobx';
import {deserializeError} from 'serialize-error';

import {type ExtensionOptions, defaultOptions} from '../data/options';
import {type QualityRecord, effectiveQuality, qualityRevision} from '../data/qualitySettings';
import getLogger from '../tools/getLogger';
import getNow from '../tools/getNow';
import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';

import FiltersStore from './FiltersStore';
import ProfilesStore from './ProfilesStore';
import SearchStore from './SearchStore';
import TrackersStore from './TrackersStore';

const logger = getLogger('runtime');

export default class RootStore {
  optionValues: ExtensionOptions = defaultOptions;
  qualityRecord: QualityRecord | null = null;
  settingsReady = false;
  readonly profiles = new ProfilesStore();
  readonly trackers = new TrackersStore();
  readonly filters = new FiltersStore(() => this.optionValues.categoryWordFilter);
  readonly searches = observable.array<SearchStore>([], {deep: false});
  private searchId = 0;

  constructor() {
    makeAutoObservable<this, 'searchId'>(
      this,
      {
        optionValues: observableRef,
        qualityRecord: observableRef,
        profiles: false,
        trackers: false,
        filters: false,
        searches: false,
        searchId: false,
      },
      {autoBind: true},
    );
  }

  setRuntimeSettings(options: ExtensionOptions, quality: QualityRecord | null) {
    const changed =
      this.optionValues.defineCategory !== options.defineCategory ||
      qualityRevision(this.qualityRecord, this.optionValues) !== qualityRevision(quality, options);
    this.optionValues = options;
    this.qualityRecord = quality;
    this.settingsReady = true;
    if (changed) for (const search of this.searches) search.regrade();
  }

  get searchReady() {
    return this.settingsReady && this.profiles.state === 'done' && this.trackers.state === 'done';
  }

  get qualitySettings() {
    return effectiveQuality(this.qualityRecord, this.optionValues);
  }

  createSearch(query: string) {
    const search = new SearchStore(++this.searchId, query, this);
    this.searches.push(search);
    return search;
  }

  destroySearch(id: number) {
    const index = this.searches.findIndex((search) => search.id === id);
    if (index !== -1) {
      this.searches[index].dispose();
      this.searches.splice(index, 1);
    }
  }

  async checkForUpdate() {
    try {
      const {lastCheckUpdateAt} = await storageGet({lastCheckUpdateAt: 0});
      if (lastCheckUpdateAt + 86400 > getNow()) return;
      await storageSet({lastCheckUpdateAt: getNow()});
      const response = await chrome.runtime.sendMessage({action: 'update'});
      if (!response) throw new Error('Result is empty');
      if (response.error) throw deserializeError(response.error);
    } catch (error) {
      logger.error('Check for update failed', error);
    }
  }
}
