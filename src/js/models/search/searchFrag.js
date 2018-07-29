import searchFragTableModel from "./searchFragTable";
import trackerSearchModel from "./trackerSearch";
import {types, isAlive, getParent, getRoot} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import optionsModel from "../optionsModel";

const debug = getLogger('searchFrag');

/**
 * @typedef {{}} SearchFragM
 * Model:
 * @property {string} state
 * @property {number} id
 * @property {string} query
 * @property {Map<string,TrackerSearchM>} trackerSearchMap
 * @property {SearchFragTableM[]} tables
 * Actions:
 * @property {function(string)} setState
 * @property {function} search
 * @property {function} searchNext
 * @property {function} addTable
 * @property {function(string)} pushSearchTracker
 * Views:
 * @property {ProfileM} profile
 * @property {function:string} getTableId
 * @property {function:TrackerSearchM[]} getSelectedTrackerSearch
 * @property {function(TrackerSearchM):number} getTrackerResultCount
 * @property {function(TrackerSearchM):number} getTrackerVisibleResultCount
 * @property {function(ProfileM):number} getSearchTrackerByTracker
 */

const searchFragModel = types.model('searchFragModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, done
  id: types.identifier(types.number),
  query: types.string,
  trackerSearchMap: types.optional(types.map(trackerSearchModel), {}),
  tables: types.optional(types.array(searchFragTableModel), []),
}).actions(/**SearchFragM*/self => {
  const isReady = () => {
    if (self.state !== 'done') {
      throw new Error('SearchFrag is not ready');
    }
  };

  return {
    setState(value) {
      self.state = value;
    },
    search() {
      isReady();
      self.addTable();
      self.trackerSearchMap.forEach(trackerSearch => {
        trackerSearch.search();
      });
    },
    searchNext() {
      isReady();
      self.addTable();
      self.trackerSearchMap.forEach(trackerSearch => {
        trackerSearch.searchNext();
      });
    },
    addTable() {
      self.tables.push(searchFragTableModel.create({
        id: self.getTableId(),
        index: self.tables.length,
        sortByList: optionsModel.get('sortByList'),
      }));
    },
    pushSearchTracker(trackerId) {
      self.trackerSearchMap.put({
        id: self.id + '_' + trackerId,
        query: self.query,
        trackerId: trackerId
      });
    }
  };
}).views(/**SearchFragM*/self => {
  let readyPromise = null;

  return {
    get readyPromise() {
      return readyPromise;
    },
    get profile() {
      return getParent(self, 1).profile;
    },
    getTableId() {
      return self.id + '_' + self.tables.length;
    },
    getSelectedTrackerSearch() {
      return self.profile.getSelectedProfileTrackers().map(profileTracker => {
        return self.getSearchTrackerByTracker(profileTracker);
      }).filter(a => !!a);
    },
    getTrackerResultCount(trackerSearch) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerResultCount(trackerSearch);
      }, 0);
    },
    getTrackerVisibleResultCount(trackerSearch) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerVisibleResultCount(trackerSearch);
      }, 0);
    },
    getSearchTrackerByTracker(profile) {
      return self.trackerSearchMap.get(self.id + '_' + profile.id);
    },
    afterCreate() {
      self.setState('loading');
      readyPromise = self.profile.readyPromise.then(() => {
        if (isAlive(self)) {
          self.setState('done');
          self.profile.getSelectedProfileTrackers().forEach(profileTracker => {
            self.pushSearchTracker(profileTracker.id);
          });
          self.search();
        } else {
          debug('skip, dead');
        }
      }).catch(err => {
        debug('afterCreate error', err);
      });
    }
  };
});

export default searchFragModel;