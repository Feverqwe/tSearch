import {flow, isAlive, resolveIdentifier, types} from "mobx-state-tree";
import getLogger from "../tools/getLogger";
import getExplorerModules from "../tools/getExplorerModules";
import {TrackerOptionsStore} from "./TrackerStore";
import ExplorerModuleWorker from "../tools/explorerModuleWorker";


const logger = getLogger('ExplorerStore');


/**
 * @typedef {{}} ExplorerModuleMetaActionStore
 * @property {string} icon
 * @property {string} title
 * @property {*} command
 * @property {boolean} isLoading
 * @property {function} setLoading
 * @property {function} getTitle
 * @property {function} handleClick
 */
const ExplorerModuleMetaActionStore = types.model('ExplorerModuleMetaActionStore', {
  icon: types.string,
  title: types.string,
  command: types.frozen(),
  isLoading: types.boolean,
}).preProcessSnapshot(snapshot => {
  snapshot.isLoading = false;
  return snapshot;
}).actions(self => {
  return {
    setLoading(state) {
      self.isLoading = state;
    },
  };
}).views(self => {
  return {
    getTitle() {
      const sectionMeta = /**ExploreModuleMetaM*/getParent(self, 2);
      return processLocale(self.title, sectionMeta.getLocale());
    },
    handleClick(e) {
      e.preventDefault();

      if (!self.isLoading) {
        self.setLoading(true);
        const module = /**ExploreModuleM*/getParent(self, 3);
        module.sendCommand(self.command).finally(() => {
          self.setLoading(false);
        }).catch(err => {
          debug('handleClick error', self.command, err);
        });
      }
    }
  };
});


/**
 * @typedef {{}} ExplorerModuleMetaStore
 * @property {string} name
 * @property {string} version
 * @property {string|undefined} author
 * @property {string|undefined} description
 * @property {string|undefined} homepageURL
 * @property {string|undefined} icon
 * @property {string|undefined} icon64
 * @property {string|undefined} siteURL
 * @property {string|undefined} downloadURL
 * @property {string|undefined} supportURL
 * @property {string[]} require
 * @property {string[]} connect
 * @property {ExplorerModuleMetaActionStore[]} actions
 * @property {*} locales
 * @property {string|undefined} defaultLocale
 * @property {function} getLocale
 * @property {function} getName
 */
const ExplorerModuleMetaStore = types.model('ExplorerModuleMetaStore', {
  name: types.string,
  version: types.string,
  author: types.maybe(types.string),
  description: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  icon: types.maybe(types.string),
  icon64: types.maybe(types.string),
  siteURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
  supportURL: types.maybe(types.string),
  require: types.array(types.string),
  connect: types.array(types.string),
  actions: types.array(ExplorerModuleMetaActionStore),
  locales: types.frozen(),
  defaultLocale: types.maybe(types.string),
}).actions(self => {
  return {};
}).views(self => {
  let locale = null;

  return {
    getLocale() {
      if (!locale) {
        locale = getLocale(self.defaultLocale, self.locales);
      }
      return locale;
    },
    getName() {
      return processLocale(self.name, self.getLocale());
    }
  }
});


/**
 * @typedef {{}} ExplorerModuleStore
 * @property {string} id
 * @property {TrackerOptionsStore} [options]
 * @property {ExplorerModuleMetaStore} meta
 * @property {string} code
 * @property {function} setOptions
 * @property {*} worker
 * @property {function} createWorker
 * @property {function} destroyWorker
 * @property {function} reloadWorker
 * @property {function} beforeDestroy
 */
const ExplorerModuleStore = types.model('ExplorerModuleStore', {
  id: types.identifier,
  options: types.optional(TrackerOptionsStore, {}),
  meta: ExplorerModuleMetaStore,
  code: types.string
}).actions(/**ExplorerModuleStore*/self => {
  return {
    setOptions(value) {
      self.options = value;
    }
  };
}).views(/**ExplorerModuleStore*/self => {
  let worker = null;
  return {
    get worker() {
      return worker;
    },
    createWorker() {
      if (!worker) {
        worker = new ExplorerModuleWorker(self.toJSON());
      }
    },
    destroyWorker() {
      if (worker) {
        worker.destroy();
      }
      worker = null;
    },
    reloadWorker() {
      if (worker) {
        self.destroyWorker();
        self.createWorker();
      }
    },
    beforeDestroy() {
      self.destroyWorker();
    }
  };
});


/**
 * @typedef {{}} ExplorerSectionStore
 * @property {string} id
 * @property {string} [state]
 * @property {boolean} [collapsed]
 * @property {function:Promise} fetchData
 * @property {*} module
 */
const ExplorerSectionStore = types.model('ExplorerSectionStore', {
  id: types.identifier,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  collapsed: types.optional(types.boolean, false),
  authRequired: types.maybe(types.model({
    url: types.string
  })),
}).actions(self => {
  return {
    fetchData: flow(function* () {
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
}).views(self => {
  return {
    get module() {
      if (isAlive(self)) {
        return resolveIdentifier(ExplorerModuleStore, self, self.id);
      }
    }
  };
});


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