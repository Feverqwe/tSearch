import profileModel from './profile/profile';
import trackerModel from './tracker';
import searchFormModel from "./searchForm";
import searchFragModel from "./search/searchFrag";
import filterModel from "./filters";
import getSearchFragModelId from "../tools/getSearchFragModelId";
import exploreModel from "./explore/explore";
import page from "./page";
import {destroy, getSnapshot, resolveIdentifier, types} from "mobx-state-tree";
import promisifyApi from "../tools/promisifyApi";
import profileTemplateModel from "./profile/profileTemplate";
import historyModel from "./history";
import profileEditorModel from "./profileEditor";

const debug = require('debug')('indexModel');
const promiseLimit = require('promise-limit');

const oneLimit = promiseLimit(1);

/**
 * @typedef {{}} IndexM
 * Model:
 * @property {ProfileM} profile
 * @property {ProfileTemplateM[]} profiles
 * @property {Map<string,TrackerM>} trackers
 * @property {SearchFormM} searchForm
 * @property {SearchFragM} searchFrag
 * @property {FilterM} filter
 * @property {ExploreM} explore
 * @property {PageM[]} page
 * @property {HistoryM[]} history
 * Actions:
 * @property {function(string)} setState
 * @property {function(ProfileM[])} setProfiles
 * @property {function(string)} createSearch
 * @property {function} clearSearch
 * @property {function(string)} setProfile
 * @property {function(string)} removeProfile
 * @property {function(string, string)} setTrackerState
 * @property {function} createProfileEditor
 * @property {function} destroyProfileEditor
 * Views:
 * @property {function:Promise} saveProfile
 * @property {function:Promise} saveProfiles
 * @property {function(string):ProfileM} getProfileTemplate
 * @property {Object} localStore
 * @property {function} onProfileChange
 * @property {function} afterCreate
 * @property {function(string):TrackerM} getTrackerModel
 * @property {function:TrackerM[]} getAllTrackerModules
 * @property {function(string)} changeProfile
 * @property {function(string, [Object])} initTrackerModule
 * @property {function(string, string, string)} moveProfile
 */

const indexModel = types.model('indexModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, ready, error
  profile: types.maybe(profileModel),
  profiles: types.optional(types.array(profileTemplateModel), []),
  trackers: types.optional(types.map(trackerModel), {}),
  searchForm: types.optional(searchFormModel, {}),
  searchFrag: types.maybe(searchFragModel),
  filter: types.optional(filterModel, {}),
  explore: types.optional(exploreModel, {}),
  page: types.optional(page, {}),
  history: types.optional(historyModel, {}),
  profileEditor: types.maybe(profileEditorModel),
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
    removeProfile(name) {
      const profile = self.getProfileTemplate(name);
      if (profile) {
        destroy(profile);
      }
      self.saveProfiles();
    },
    createProfileEditor() {
      self.profileEditor = {};
    },
    destroyProfileEditor() {
      self.profileEditor = null;
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

  return {
    saveProfile() {
      return oneLimit(() => {
        promisifyApi('chrome.storage.local.set')({profile: self.profile.name});
      });
    },
    saveProfiles() {
      return oneLimit(() => {
        promisifyApi('chrome.storage.local.set')({profiles: getSnapshot(self.profiles)});
      });
    },
    getProfileTemplate(name) {
      return name && resolveIdentifier(profileTemplateModel, self, name);
    },
    getTrackerModel(id) {
      return self.trackers.get(id);
    },
    getAllTrackerModules() {
      return Array.from(self.trackers.values());
    },
    get localStore() {
      return localStore;
    },
    changeProfile(name) {
      self.setProfile(name);
      return self.saveProfile();
    },
    moveProfile(index, prevIndex, nextIndex) {
      const profiles = self.profiles.slice(0);
      const item = profiles[index];
      const prevItem = profiles[prevIndex];
      const nextItem = profiles[nextIndex];

      profiles.splice(index, 1);

      if (prevItem) {
        const pos = profiles.indexOf(prevItem);
        if (pos !== -1) {
          profiles.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = profiles.indexOf(nextItem);
        if (pos !== -1) {
          profiles.splice(pos, 0, item);
        }
      } else {
        profiles.push(item);
      }

      self.setProfiles(profiles);
      return self.saveProfiles();
    },
    afterCreate() {
      self.setState('loading');
      promisifyApi('chrome.storage.local.get')({
        profile: null,
        profiles: [],
        sortByList: [{by: 'quality'}]
      }).then(storage => {
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