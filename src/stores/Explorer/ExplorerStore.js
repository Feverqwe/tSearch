import {flow, isAlive, types} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import getExplorerModules from "../../tools/getExplorerModules";
import ExplorerModuleStore from "./ExplorerModuleStore";
import ExplorerSectionStore from "./ExplorerSectionStore";


const logger = getLogger('ExplorerStore');

/**
 * @typedef {{}} ExplorerStore
 * @property {string} [state]
 * @property {ExplorerSectionStore[]} sections
 * @property {Map<*,ExplorerModuleStore>|undefined} modules
 * @property {function:Promise} fetch
 */
const ExplorerStore = types.model('ExplorerStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  sections: types.array(ExplorerSectionStore),
  modules: types.maybe(types.map(ExplorerModuleStore)),
}).actions(/**ExplorerStore*/self => {
  return {
    fetch: flow(function* () {
      self.state = 'pending';
      try {
        const [modules, sections] = yield Promise.all([
          fetchModules(),
          fetchSections()
        ]);
        if (isAlive(self)) {
          self.sections = sections;
          self.modules = modules;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetch error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
  };
}).views(self => {
  return {};
});

const fetchModules = async () => {
  return await getExplorerModules();
};

const fetchSections = async () => {
  const storage = await new Promise(resolve => chrome.storage.sync.get({
    sections: [{
      id: 'favorite'
    }, {
      id: 'kpFavorites'
    }, {
      id: 'kpInCinema'
    }, {
      id: 'imdbInCinema'
    }, {
      id: 'kpPopular'
    }, {
      id: 'imdbPopular'
    }, {
      id: 'kpSeries'
    }, {
      id: 'imdbSeries'
    }, {
      id: 'ggGamesNew'
    }, {
      id: 'ggGamesTop'
    }]
  }, resolve));
  return storage.sections;
};

export default ExplorerStore;
export {ExplorerModuleStore};