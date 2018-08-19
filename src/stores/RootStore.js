import {types} from 'mobx-state-tree';
import SearchForm from "./SearchFormStore";
import HistoryStore from "./HistoryStore";
import FiltersStore from "./FiltersStore";
import ProfilesStore from "./ProfilesStore";
import ProfileStore from "./ProfileStore";
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} RootStore
 * @property {SearchForm} [searchForm]
 * @property {HistoryStore} [history]
 * @property {FiltersStore} [filters]
 * @property {ProfileStore|undefined} profile
 * @property {ProfilesStore} [profiles]
 * @property {Map<*,TrackerStore>} trackers
 * @property {function} setProfile
 * @property {function} initTracker
 */
const RootStore = types.model('RootStore', {
  searchForm: types.optional(SearchForm, {}),
  history: types.optional(HistoryStore, {}),
  filters: types.optional(FiltersStore, {}),
  profile: types.maybe(ProfileStore),
  profiles: types.optional(ProfilesStore, {}),
  trackers: types.map(TrackerStore),
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
    }
  };
});

export default RootStore;