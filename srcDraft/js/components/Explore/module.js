import {getSnapshot, types} from "mobx-state-tree";
import exploreModuleMetaModel from "./moduleMeta";
import sectionItemMode from "./sectionItem";
import Cache from "../../../../src/tools/cache";
import SectionWorker from "../../../../src/tools/sectionWorker";
import getLogger from "../../../../src/tools/getLogger";

const debug = getLogger('exploreModuleModel');

/**
 * @typedef {{}} ExploreModuleM
 * Model:
 * @property {string} id
 * @property {ExploreModuleMetaM} meta
 * @property {ExploreModuleInfoM} info
 * @property {{url: string}} [authRequired]
 * @property {string} code
 * @property {ExploreSectionItemM[]} items
 * Actions:
 * @property {function:SectionWorker} getWorker
 * @property {function} destroyWorker
 * @property {function(string)} setState
 * @property {function(ExploreSectionItemM[])} setItems
 * @property {function({url:string}|null)} setAuthRequired
 * Views:
 * @property {function:Cache} getCache
 * @property {function:Promise} saveItems
 * @property {function:ExploreSectionItemM[]} getItems
 * @property {function} preloadItems
 * @property {function} loadItems
 * @property {function(string)} sendCommand
 */

/**
 * @typedef {{}} ExploreModuleInfoM
 * Model:
 * @property {number} lastUpdate
 * @property {boolean} disableAutoUpdate
 * Actions:
 * Views:
 */

const exploreModuleModel = types.model('exploreModuleModel', {
  id: types.identifier(types.string),
  state: types.optional(types.string, 'idle'), // idle, loading, ready, error
  meta: exploreModuleMetaModel,
  info: types.model('exploreModuleInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  authRequired: types.maybe(types.model({
    url: types.string
  })),
  code: types.string,
  items: types.optional(types.array(sectionItemMode), []),
}).actions(/**ExploreModuleM*/self => {
  return {
    setState(value) {
      self.state = value;
    },
    setItems(items) {
      self.items = items;
    },
    setAuthRequired(value) {
      self.authRequired = value;
    },
  };
}).views(/**ExploreModuleM*/self => {
  const cache = new Cache(self.id);
  let worker = null;

  return {
    getWorker() {
      if (!worker) {
        worker = new SectionWorker(getSnapshot(self));
      }
      return worker;
    },
    destroyWorker() {
      if (worker) {
        worker.destroy();
        worker = null;
      }
    },
    getCache() {
      return cache;
    },
    saveItems() {
      return cache.setData(getSnapshot(self.items));
    },
    getItems() {
      return self.items;
    },
    preloadItems() {
      if (!cache.isLoaded()) {
        self.loadItems();
      }
    },
    loadItems() {
      self.setState('loading');
      self.setAuthRequired(null);

      return Promise.resolve().then(() => {
        return cache.getData([]);
      }).then(cacheData => {
        if (!cache.isExpire(cacheData)) {
          self.setItems(cacheData.data);
        } else {
          return self.getWorker().getItems().finally(() => {
            self.destroyWorker();
          }).then(async response => {
            const {items} = response;
            if (items) {
              self.setItems(items);
              await self.saveItems();
            }
          });
        }
      }).then(() => {
        self.setState('ready');
      }).catch(err => {
        debug('loadItems error', err);
        if (err.message === 'AUTH') {
          self.setAuthRequired({url: err.url});
        }
        self.setState('error');
      });
    },
    sendCommand(command) {
      self.setAuthRequired(null);

      return self.getWorker().sendCommand(command).finally(() => {
        self.destroyWorker();
      }).then(async result => {
        debug('Command result', command, result);
        const {items} = result;
        if (items) {
          self.setItems(items);
          await self.saveItems();
        }
      }).catch(err => {
        debug('sendCommand error', command, err);
        if (err.message === 'AUTH') {
          self.setAuthRequired({url: err.url});
        }
      });
    },
    postProcessSnapshot(snapshot) {
      snapshot.state = undefined;
      snapshot.authRequired = undefined;
      snapshot.items = undefined;
      return snapshot;
    },
    beforeDestroy() {
      self.destroyWorker();
    }
  };
});

export default exploreModuleModel;