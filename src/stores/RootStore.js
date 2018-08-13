import {types} from 'mobx-state-tree';
import SearchForm from "./SearchFormStore";
import HistoryStore from "./HistoryStore";
import FiltersStore from "./FiltersStore";
import ProfilesStore from "./ProfilesStore";
import ProfileStore from "./ProfileStore";


/**
 * @typedef {{}} RootStore
 * @property {SearchForm} [searchForm]
 * @property {HistoryStore} [history]
 * @property {FiltersStore} [filters]
 * @property {ProfileStore|undefined} profile
 * @property {ProfilesStore} [profiles]
 * @property {function} setProfile
 */
const RootStore = types.model('RootStore', {
  searchForm: types.optional(SearchForm, {}),
  history: types.optional(HistoryStore, {}),
  filters: types.optional(FiltersStore, {}),
  profile: types.maybe(ProfileStore),
  profiles: types.optional(ProfilesStore, {}),
}).actions(/**RootStore*/self => {
  return {
    setProfile(profile) {
      self.profile = profile.toJSON();
    }
  };
});

export default RootStore;