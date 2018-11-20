import {flow, isAlive, types, resolveIdentifier} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import getExplorerModules from "../../tools/getExplorerModules";
import ExplorerModuleStore from "./ExplorerModuleStore";
import ExplorerSectionStore from "./ExplorerSectionStore";
import _isEqual from "lodash.isequal";
import ExplorerFavoritesSectionStore from "./ExplorerFavoritesSectionStore";
import storageSet from "../../tools/storageSet";
import storageGet from "../../tools/storageGet";

const promiseLimit = require('promise-limit');

const logger = getLogger('ExplorerStore');
const limitOne = promiseLimit(1);

/**
 * @typedef {{}} ExplorerStore
 * @property {string} [state]
 * @property {ExplorerSectionStore[]} sections
 * @property {Map<*,ExplorerModuleStore>|undefined} modules
 * @property {function} setSections
 * @property {function} setState
 * @property {function:Promise} fetch
 * @property {function} saveSections
 * @property {function} moveSection
 */
const ExplorerStore = types.model('ExplorerStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  sections: types.array(types.union({
    dispatcher(snapshot) {
      return snapshot.id === 'favorites' ? ExplorerFavoritesSectionStore : ExplorerSectionStore;
    }
  }, ExplorerSectionStore, ExplorerFavoritesSectionStore)),
  modules: types.maybe(types.map(ExplorerModuleStore)),
}).actions(/**ExplorerStore*/self => {
  return {
    setSections(sections) {
      self.sections = sections;
    },
    setState(value) {
      self.state = value;
    },
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
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'sync') {
      const change = changes.explorerSections;
      if (change) {
        const explorerSections = change.newValue || [];
        if (!_isEqual(explorerSections, self.getSectionsSnapshot())) {
          self.setSections([]);
          self.setSections(explorerSections);
        }
      }
    }
  };

  return {
    getSectionsSnapshot() {
      return self.sections.map(section => section.getSnapshot());
    },
    saveSections() {
      return limitOne(() => {
        const sections = self.getSectionsSnapshot();
        return storageSet({explorerSections: sections}, 'sync');
      });
    },
    moveSection(index, prevIndex, nextIndex) {
      const sections = self.sections.slice(0);
      const item = sections[index];
      const prevItem = sections[prevIndex];
      const nextItem = sections[nextIndex];

      sections.splice(index, 1);

      if (prevItem) {
        const pos = sections.indexOf(prevItem);
        if (pos !== -1) {
          sections.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = sections.indexOf(nextItem);
        if (pos !== -1) {
          sections.splice(pos, 0, item);
        }
      } else {
        sections.push(item);
      }

      self.setSections(sections);
      return self.saveSections();
    },
    get favoritesSection() {
      return resolveIdentifier(ExplorerFavoritesSectionStore, self, 'favorites');
    },
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

const fetchModules = async () => {
  return await getExplorerModules();
};

const fetchSections = async () => {
  const storage = await storageGet({
    explorerSections: [{
      id: 'favorites'
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
  }, 'sync');
  return storage.explorerSections;
};

export default ExplorerStore;
export {ExplorerModuleStore};