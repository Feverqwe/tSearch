import {types} from 'mobx-state-tree';
import SearchForm from "./SearchFormStore";
import HistoryStore from "./HistoryStore";
import FiltersStore from "./FiltersStore";
import ProfilesStore from "./ProfilesStore";
import SearchStore from "./SearchStore";
import OptionsStore from "./OptionsStore";
import ExplorerStore from "./Explorer/ExplorerStore";
import ProfileEditorStore from "./ProfileEditorStore";
import TrackersStore from "./TrackersStore";
import EditorStore from "./EditorStore";
import CodeMakerStore from "./CodeMakerStore";
import PageStore from "./PageStore";
import storageGet from "../tools/storageGet";
import getNow from "../tools/getNow";
import storageSet from "../tools/storageSet";
import {ErrorWithCode} from "../tools/errors";
import getLogger from "../tools/getLogger";

const deserializeError = require('deserialize-error');

const logger = getLogger('RootStore');

/**
 * @typedef {{}} RootStore
 * @property {SearchForm} [searchForm]
 * @property {HistoryStore} [history]
 * @property {FiltersStore} [filters]
 * @property {ProfilesStore} [profiles]
 * @property {TrackersStore} [trackers]
 * @property {Map<*,SearchStore>} searches
 * @property {OptionsStore} [options]
 * @property {ExplorerStore} [explorer]
 * @property {ProfileEditorStore|undefined|null} profileEditor
 * @property {EditorStore|undefined|null} editor
 * @property {CodeMakerStore|undefined|null} codeMaker
 * @property {PageStore} [page]
 * @property {function} createSearch
 * @property {function} destroySearch
 * @property {function} createProfileEditor
 * @property {function} destroyProfileEditor
 * @property {function} createEditor
 * @property {function} destroyEditor
 * @property {function} createCodeMaker
 * @property {function} destroyCodeMaker
 * @property {function} afterCreate
 */
const RootStore = types.model('RootStore', {
  searchForm: types.optional(SearchForm, {}),
  history: types.optional(HistoryStore, {}),
  filters: types.optional(FiltersStore, {}),
  profiles: types.optional(ProfilesStore, {}),
  trackers: types.optional(TrackersStore, {}),
  searches: types.map(SearchStore),
  options: types.optional(OptionsStore, {}),
  explorer: types.optional(ExplorerStore, {}),
  profileEditor: types.maybeNull(ProfileEditorStore),
  editor: types.maybeNull(EditorStore),
  codeMaker: types.maybeNull(CodeMakerStore),
  page: types.optional(PageStore, {}),
}).actions(/**RootStore*/self => {
  return {
    createSearch(query) {
      self.searches.set(query, SearchStore.create({query}));
    },
    destroySearch(query) {
      self.searches.delete(query);
    },
    createProfileEditor() {
      self.profileEditor = {
        profiles: JSON.parse(JSON.stringify(self.profiles.profiles))
      };
    },
    destroyProfileEditor() {
      self.profileEditor = null;
    },
    createEditor(type, id) {
      self.editor = {type, id};
    },
    destroyEditor() {
      self.editor = null;
    },
    createCodeMaker() {
      self.codeMaker = {};
    },
    destroyCodeMaker() {
      self.codeMaker = null;
    },
    checkForUpdate() {
      checkForUpdate().then(() => {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({action: 'update'}, (result) => {
            if (!result) {
              reject(new Error('Result is empty'));
            }
            if (result.error) {
              reject(deserializeError(result.error));
            } else {
              resolve(result.result);
            }
          });
        });
      }).catch(err => {
        if (err.code === 'TIMEOUT') {
          logger.error('checkForUpdate error:', err);
        }
      });
    },
    afterCreate() {
      self.page.init();
      self.checkForUpdate();
    },
  };
});

const checkForUpdate = () => {
  return storageGet({lastCheckUpdateAt: 0}).then(storage => {
    if (storage.lastCheckUpdateAt + 86400 > getNow()) {
      throw new ErrorWithCode('Timeout', 'TIMEOUT');
    }
    return storageSet({lastCheckUpdateAt: getNow()}).then(() => true);
  });
};

export default RootStore;