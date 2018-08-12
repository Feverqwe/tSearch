import {types} from 'mobx-state-tree';
import SearchForm from "./SearchFormStore";
import HistoryStore from "./HistoryStore";


/**
 * @typedef {{}} RootStore
 * @property {SearchForm} [searchForm]
 * @property {HistoryStore} [history]
 */
const RootStore = types.model('RootStore', {
  searchForm: types.optional(SearchForm, {}),
  history: types.optional(HistoryStore, {}),
});

export default RootStore;