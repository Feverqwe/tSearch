import moduleModel from "./module";
import {types, applySnapshot, getSnapshot} from "mobx-state-tree";
import promisifyApi from "../../tools/promisifyApi";
import sectionModel from "./section";
import favoriteModuleModel from "./favoriteModule";
import loadExploreModule from "../../tools/loadExploreModule";

const debug = require('debug')('explore');
const promiseLimit = require('promise-limit');

const limitOne = promiseLimit(1);

/**
 * @typedef {{}} ExploreM
 * Model:
 * @property {string} state
 * @property {ExploreSectionM[]} sections
 * @property {ExploreModuleM[]} modules
 * @property {ExploreFavoriteModuleM} favouriteModule
 * Actions:
 * @property {function(ExploreSectionM[])} setSections
 * @property {string} setState
 * @property {function(ExploreFavoriteModuleM)} putModule
 * Views:
 * @property {function:Promise} saveSections
 * @property {function(number,number|null,number|null)} moveSection
 * @property {function(string):Promise<ExploreFavoriteModuleM>} loadModule
 */

const exploreModel = types.model('exploreModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, ready, error
  sections: types.optional(types.array(sectionModel), []),
  modules: types.optional(types.map(moduleModel), {}),
  favouriteModule: types.optional(favoriteModuleModel, {
    id: 'favorite'
  }),
}).actions(/**ExploreM*/self => {
  return {
    setSections(sections) {
      self.sections = sections;
    },
    setState(value) {
      self.state = value;
    },
    putModule(module) {
      self.modules.put(module);
    }
  };
}).views(/**ExploreM*/self => {
  return {
    saveSections() {
      return limitOne(() => {
        const sections = getSnapshot(self.sections);
        return promisifyApi('chrome.storage.local.set')({explorerSections: sections});
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
    async loadModule(id) {
      if (id === 'favorite') {
        return null;
      }

      let module = self.modules.get(id);
      if (!module) {
        const key = `exploreModule_${id}`;
        module = await promisifyApi('chrome.storage.local.get')({
          [key]: null
        }).then(storage => storage[key]);
        if (!module) {
          module = await loadExploreModule(id);
          if (module) {
            await promisifyApi('chrome.storage.local.set')({[key]: module});
          }
        }
        if (module) {
          self.putModule(module);
        }
      }
      return module;
    },
    afterCreate() {
      self.setState('loading');
      return promisifyApi('chrome.storage.local.get')({
        explorerSections: []
      }).then(async storage => {
        if (!storage.explorerSections.length) {
          storage.explorerSections = [{
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
          }];
          await promisifyApi('chrome.storage.local.set')({explorerSections: storage.explorerSections});
        }
        applySnapshot(self, Object.assign({}, {
          sections: storage.explorerSections
        }));
        self.setState('ready');
      }).catch(err => {
        debug('Load explore error', err);
        self.setState('error');
      });
    }
  };
});

export default exploreModel;