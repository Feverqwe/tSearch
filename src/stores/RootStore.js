import {types} from 'mobx-state-tree';
import SearchForm from "./SearchFormStore";
import HistoryStore from "./HistoryStore";
import FiltersStore from "./FiltersStore";
import ProfilesStore from "./ProfilesStore";
import SearchStore from "./SearchStore";
import OptionsStore from "./OptionsStore";
import ExplorerStore from "./ExplorerStore";
import ProfileEditorStore from "./ProfileEditorStore";
import TrackersStore from "./TrackersStore";


/**
 * @typedef {{}} RootStore
 * @property {SearchForm} [searchForm]
 * @property {HistoryStore} [history]
 * @property {FiltersStore} [filters]
 * @property {ProfilesStore} [profiles]
 * @property {TrackersStore} [trackers]
 * @property {SearchStore[]} searches
 * @property {OptionsStore} [options]
 * @property {ExplorerStore} [explorer]
 * @property {ProfileEditorStore|undefined|null} profileEditor
 * @property {function} createSearch
 * @property {function} destroySearch
 * @property {function} createProfileEditor
 * @property {function} destroyProfileEditor
 */
const RootStore = types.model('RootStore', {
  searchForm: types.optional(SearchForm, {}),
  history: types.optional(HistoryStore, {}),
  filters: types.optional(FiltersStore, {}),
  profiles: types.optional(ProfilesStore, {}),
  trackers: types.optional(TrackersStore, {}),
  searches: types.array(SearchStore),
  options: types.optional(OptionsStore, {}),
  explorer: types.optional(ExplorerStore, {}),
  profileEditor: types.maybeNull(ProfileEditorStore)
}).actions(/**RootStore*/self => {
  return {
    createSearch(query) {
      self.searches.push({query});
      return self.searches.slice(-1)[0];
    },
    destroySearch(search) {
      const pos = self.searches.indexOf(search);
      if (pos !== -1) {
        self.searches.splice(pos, 1);
      }
    },
    createProfileEditor() {
      self.profileEditor = {
        profiles: JSON.parse(JSON.stringify(self.profiles.profiles))
      };
    },
    destroyProfileEditor() {
      self.profileEditor = null;
    }
  };
});

export default RootStore;