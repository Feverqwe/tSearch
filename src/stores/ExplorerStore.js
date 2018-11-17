import {flow, isAlive, types} from "mobx-state-tree";


/**
 * @typedef {{}} ExplorerSectionStore
 * @property {string} id
 */
const ExplorerSectionStore = types.model('ExplorerSectionStore', {
  id: types.identifier,
  collapsed: types.optional(types.boolean, false),
}).actions(self => {
  return {
    fetchModule: flow(function* () {
      self.state = 'pending';
      try {
        if (isAlive(self)) {
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchSections error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
  };
});


/**
 * @typedef {{}} ExplorerStore
 * @property {string} [state]
 * @property {ExplorerSectionStore[]} sections
 * @property {function:Promise} fetchSections
 */
const ExplorerStore = types.model('ExplorerStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  sections: types.array(ExplorerSectionStore),
}).actions(/**ExplorerStore*/self => {
  return {
    fetchSections: flow(function* () {
      self.state = 'pending';
      try {
        const storage = yield new Promise(resolve => chrome.storage.sync.get({
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
        if (isAlive(self)) {
          self.sections = storage.sections;
          self.state = 'done';
        }
      } catch (err) {
        logger.error('fetchSections error', err);
        if (isAlive(self)) {
          self.state = 'error';
        }
      }
    }),
  };
}).views(self => {
  return {};
});

export default ExplorerStore;