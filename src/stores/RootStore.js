import {types} from 'mobx-state-tree';
import SearchForm from "./SearchFormStore";
import HistoryStore from "./HistoryStore";
import FiltersStore from "./FiltersStore";
import ProfilesStore from "./ProfilesStore";
import ProfileStore from "./ProfileStore";
import TrackerStore from "./TrackerStore";
import SearchStore from "./SearchStore";
import OptionsStore from "./OptionsStore";


/**
 * @typedef {{}} RootStore
 * @property {SearchForm} [searchForm]
 * @property {HistoryStore} [history]
 * @property {FiltersStore} [filters]
 * @property {ProfileStore|undefined} profile
 * @property {ProfilesStore} [profiles]
 * @property {Map<*,TrackerStore>} trackers
 * @property {SearchStore[]} searches
 * @property {OptionsStore} options
 * @property {function} setProfile
 * @property {function} initTracker
 * @property {function} createSearch
 * @property {function} destroySearch
 */
const RootStore = types.model('RootStore', {
  searchForm: types.optional(SearchForm, {}),
  history: types.optional(HistoryStore, {}),
  filters: types.optional(FiltersStore, {}),
  profile: types.maybe(ProfileStore),
  profiles: types.optional(ProfilesStore, {}),
  trackers: types.map(TrackerStore),
  searches: types.array(SearchStore),
  options: types.optional(OptionsStore, {}),
}).actions(/**RootStore*/self => {
  return {
    setProfile(profile) {
      self.profile = profile.toJSON();
    },
    initTracker(id) {
      let tracker = self.trackers.get(id);
      if (!tracker) {
        self.trackers.set(id, {id});
        tracker = self.trackers.get(id);
      }
      return tracker;
    },
    createSearch(query) {
      self.searches.push({query});
      return self.searches.slice(-1)[0];
    },
    destroySearch(search) {
      const pos = self.searches.indexOf(search);
      if (pos !== -1) {
        self.searches.splice(pos, 1);
      }
    }
  };
});

export default RootStore;