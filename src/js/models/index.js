import profileModel from './profile/profile';
import trackerModel from './tracker';
import searchFragModel from "./search/searchFrag";
import filterModel from "./filters";
import getSearchFragModelId from "../tools/getSearchFragModelId";
import exploreModel from "./explore/explore";
import page from "./page";
import {getSnapshot, resolveIdentifier, types} from "mobx-state-tree";
import promisifyApi from "../tools/promisifyApi";
import profileTemplateModel from "./profile/profileTemplate";
import historyModel from "./history";
import profilesEditorModel from "./profilesEditor/profilesEditor";
import _uniq from "lodash.uniq";
import _isEqual from "lodash.isequal";

const debug = require('debug')('indexModel');
const promiseLimit = require('promise-limit');

const oneLimit = promiseLimit(1);

/**
 * @typedef {{}} IndexM
 * Model:
 * @property {ProfileM} profile
 * @property {ProfileTemplateM[]} profiles
 * @property {Map<string,TrackerM>} trackers
 * @property {SearchFragM} searchFrag
 * @property {FilterM} filter
 * @property {ExploreM} explore
 * @property {PageM[]} page
 * @property {HistoryM[]} history
 * @property {ProfilesEditorM[]} profilesEditor
 * Actions:
 * @property {function(string)} setState
 * @property {function(ProfileM[])} setProfiles
 * @property {function(string)} createSearch
 * @property {function} clearSearch
 * @property {function(string)} setProfile
 * @property {function(string, string)} setTrackerState
 * @property {function} createProfilesEditor
 * @property {function} destroyProfilesEditor
 * Views:
 * @property {function:Promise} saveProfile
 * @property {function:Promise} saveProfiles
 * @property {function(string):ProfileM} getProfileTemplate
 * @property {Object} localStore
 * @property {function} onProfileChange
 * @property {function} afterCreate
 * @property {function(string):TrackerM} getTrackerModel
 * @property {function:TrackerM[]} getProfilesTrackers
 * @property {function:TrackerM[]} getTrackerModules
 * @property {function(string)} changeProfile
 * @property {function(string, [Object])} initTrackerModule
 * @property {function(string, string, string)} moveProfile
 */

const indexModel = types.model('indexModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, ready, error
  profile: types.maybe(profileModel),
  profiles: types.optional(types.array(profileTemplateModel), []),
  trackers: types.optional(types.map(trackerModel), {}),
  searchFrag: types.maybe(searchFragModel),
  filter: types.optional(filterModel, {}),
  explore: types.optional(exploreModel, {}),
  page: types.optional(page, {}),
  history: types.optional(historyModel, {}),
  profilesEditor: types.maybe(profilesEditorModel),
}).actions(/**IndexM*/self => {
  return {
    setState(value) {
      self.state = value;
    },
    setProfiles(profiles) {
      self.profiles = profiles;
    },
    createSearch(query) {
      self.history.onQuery(query);
      self.searchFrag = {
        id: getSearchFragModelId(),
        query: query
      };
    },
    destroySearch() {
      self.searchFrag = null;
    },
    setProfile(name) {
      const profileItem = self.getProfileTemplate(name);
      if (profileItem) {
        self.profile = getSnapshot(profileItem);
      }
    },
    initTrackerModule(id, template) {
      if (!self.trackers.has(id)) {
        self.trackers.put(template || {id});
      }
    },
    createProfilesEditor() {
      self.profilesEditor = {
        profiles: getSnapshot(self.profiles),
      };
    },
    destroyProfilesEditor() {
      self.profilesEditor = null;
    }
  };
}).views(/**IndexM*/self => {
  const localStore = {
    set(key, value) {
      this[key] = value;
      promisifyApi('chrome.storage.local.set')({
        [key]: value,
      });
    }
  };

  const handleProfilesChangeListener = (changes, namespace) => {
    if (namespace === 'sync') {
      const change = changes.profiles;
      if (change) {
        const profiles = change.newValue;
        if (!_isEqual(profiles, getSnapshot(self.profiles))) {
          self.setProfiles(profiles);
        }
      }
    }
  };

  return {
    saveProfile() {
      return oneLimit(() => {
        promisifyApi('chrome.storage.local.set')({profile: self.profile.name});
      });
    },
    saveProfiles() {
      return oneLimit(() => {
        promisifyApi('chrome.storage.sync.set')({profiles: getSnapshot(self.profiles)});
      });
    },
    getProfileTemplate(name) {
      return name && resolveIdentifier(profileTemplateModel, self, name);
    },
    getTrackerModel(id) {
      return self.trackers.get(id);
    },
    getProfilesTrackers() {
      const modules = [];
      /**@type IndexM*/
      self.profiles.forEach(profile => {
        return modules.push(...profile.getTrackerModules());
      });
      return _uniq(modules);
    },
    getTrackerModules() {
      return _uniq(Array.from(self.trackers.values()), self.getProfilesTrackers());
    },
    get localStore() {
      return localStore;
    },
    changeProfile(name) {
      self.setProfile(name);
      return self.saveProfile();
    },
    afterCreate() {
      self.setState('loading');
      Promise.all([
        promisifyApi('chrome.storage.local.get')({
          profile: null,
          sortByList: [{by: 'quality'}]
        }),
        promisifyApi('chrome.storage.sync.get')({
          profiles: []
        }),
      ]).then(storages => {
        return Object.assign({}, ...storages);
      }).then(storage => {
        chrome.storage.onChanged.addListener(handleProfilesChangeListener);

        self.localStore.sortByList = storage.sortByList;

        if (!storage.profiles.length) {
          storage.profiles.push({
            name: 'Default',
            trackers: [{
              id: 'rutracker'
            }, {
              id: 'nnmclub'
            }, {
              id: 'rutracker1'
            }]
          });
          storage.profiles.push({
            name: 'Default 2',
            trackers: [{
              id: 'nnmclub1'
            }]
          });
        }
        self.setProfiles(storage.profiles);

        let profile = self.getProfileTemplate(storage.profile);
        if (!profile) {
          profile = self.profiles[0];
        }
        self.setProfile(profile.name);
      }).then(() => {
        self.setState('ready');
      }).catch(err => {
        debug('index load error', err);
        self.setState('error');
      });
    },
  };
});

export default indexModel;