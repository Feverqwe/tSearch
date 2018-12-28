import {flow, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import getExplorerModules from "../../tools/getExplorerModules";
import ExplorerModuleStore from "./ExplorerModuleStore";
import ExplorerSectionStore from "./ExplorerSectionStore";
import _isEqual from "lodash.isequal";
import ExplorerFavoritesSectionStore from "./ExplorerFavoritesSectionStore";
import storageSet from "../../tools/storageSet";
import storageGet from "../../tools/storageGet";
import getUnic from "../../tools/getUnic";
import ExplorerQuickSearchStore from "./ExplorerQuickSearchStore";

const promiseLimit = require('promise-limit');

const logger = getLogger('ExplorerStore');
const limitOne = promiseLimit(1);

/**
 * @typedef {{}} ExplorerStore
 * @property {string} [state]
 * @property {*[]} sections
 * @property {Map<*,ExplorerModuleStore>|undefined} modules
 * @property {ExplorerQuickSearchStore} [quickSearch]
 * @property {function} setSections
 * @property {function} setState
 * @property {function:Promise} fetch
 * @property {function} setModule
 * @property {function} deleteModule
 * @property {function} getSectionsSnapshot
 * @property {function} saveSections
 * @property {function} moveSection
 * @property {*} favoritesSection
 * @property {function} getSectionById
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const ExplorerStore = types.model('ExplorerStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  sections: types.array(types.union({
    dispatcher(snapshot) {
      switch (snapshot.id) {
        case 'favorites': {
          return ExplorerFavoritesSectionStore;
        }
        default: {
          return ExplorerSectionStore;
        }
      }
    }
  }, ExplorerSectionStore, ExplorerFavoritesSectionStore)),
  modules: types.maybe(types.map(ExplorerModuleStore)),
  quickSearch: types.optional(ExplorerQuickSearchStore, {}),
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
          fetchSections(),
          self.quickSearch.fetch(),
        ]);
        if (isAlive(self)) {
          try {
            self.sections = sections;
          } catch (err) {
            logger.error('set setions error, sections will cleared', err);
            self.sections = [];
          }
          try {
            self.modules = modules;
          } catch (err) {
            logger.error('set modules error, sections will cleared', err);
            self.modules = {};
          }
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetch error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
    setModule(id, module) {
      self.modules.set(id, module);
    },
    deleteModule(id) {
      self.modules.delete(id);
    },
  };
}).views(self => {
  const storageChangeListener = (changes, namespace) => {
    if (self.state !== 'done') return;

    if (namespace === 'sync') {
      const change = changes.explorerSections;
      if (change) {
        const explorerSections = change.newValue || [];
        const sections = [];
        explorerSections.forEach(sectionSnapshot => {
          const section = self.getSectionById(sectionSnapshot.id);
          if (!section) {
            sections.push(sectionSnapshot);
          } else {
            if (!_isEqual(sectionSnapshot, section.getSnapshot())) {
              section.assignSnapshot(sectionSnapshot);
            }
            sections.push(section);
          }
        });
        self.setSections(sections);
      }
    }

    if (namespace === 'local') {
      const change = changes.explorerModules;
      if (change) {
        const {newValue = {}} = change;
        const ids = getUnic([...Object.keys(newValue), ...self.modules.keys()]);
        ids.forEach(id => {
          const module = self.modules.get(id);
          const newModule = newValue[id];
          if (!newModule) {
            self.deleteModule(id);
          } else
          if (!module) {
            self.setModule(id, newModule);
          } else
          if (module.code !== newModule.code) {
            self.setModule(id, newModule);
            module.reloadWorker();
          } else
          if (!_isEqual(module.options.toJSON(), newModule.options)) {
            module.setOptions(newModule.options);
          }
        });
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
    },
    get favoritesSection() {
      return resolveIdentifier(ExplorerFavoritesSectionStore, self, 'favorites');
    },
    getSectionById(id) {
      if (id === 'favorites') {
        return self.favoritesSection;
      } else {
        return resolveIdentifier(ExplorerSectionStore, self, id);
      }
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
      id: 'favorites',
      moduleId: 'favorites',
    }, {
      id: 'kpFavorites',
      moduleId: 'kpFavorites',
      moduleParams: 'categoryId=%kpFolderId%',
    }, {
      id: 'kpInCinema',
      moduleId: 'kpInCinema',
    }, {
      id: 'imdbInCinema',
      moduleId: 'imdbInCinema',
    }, {
      id: 'kpPopular',
      moduleId: 'kpPopular',
    }, {
      id: 'imdbPopular',
      moduleId: 'imdbPopular',
    }, {
      id: 'kpSeries',
      moduleId: 'kpSeries',
    }, {
      id: 'imdbSeries',
      moduleId: 'imdbSeries',
    }, {
      id: 'ggGamesNew',
      moduleId: 'ggGamesNew',
    }, {
      id: 'ggGamesTop',
      moduleId: 'ggGamesTop',
    }]
  }, 'sync');
  return storage.explorerSections;
};

export default ExplorerStore;
export {ExplorerModuleStore};