import {flow, isAlive, types} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import ExplorerItemStore from "./ExplorerItemStore";
import ExplorerCommandStore from "./ExplorerCommandStore";
import ExplorerSectionStore from "./ExplorerSectionStore";
import storageGet from "../../tools/storageGet";
import storageSet from "../../tools/storageSet";

const promiseLimit = require('promise-limit');

const logger = getLogger('ExplorerFavoritesSectionStore');
const oneLimit = promiseLimit(1);

/**
 * @typedef {{}} ExplorerFavoritesSectionStore
 * @property {string} id
 * @property {string} [state]
 * @property {boolean} [collapsed]
 * @property {number} [rowCount]
 * @property {number} [zoom]
 * @property {{url:string}|undefined} authRequired
 * @property {ExplorerItemStore[]} items
 * @property {Map<*,ExplorerCommandStore>} commands
 * @property {function} setState
 * @property {function:Promise} fetch
 * @property {function} setZoom
 * @property {function} setRowCount
 * @property {function} toggleCollapse
 * @property {function} setAuthRequired
 * @property {function} setItems
 * @property {function} createCommand
 * @property {*} module
 * @property {function} getSnapshot
 * @property {*} page
 * @property {function} fetchData
 * @property {function} fetchCommand
 */
const ExplorerFavoritesSectionStore = types.compose('ExplorerFavoritesSectionStore', ExplorerSectionStore).actions(self => {
  return {
    setState(state) {
      self.state = state;
    },
    fetchData: flow(function* (stateStore) {
      const id = self.id;
      stateStore.setState('pending');
      try {
        const storage = yield storageGet({
          explorerFavorites: [],
        });
        if (isAlive(self)) {
          self.setItems(storage.explorerFavorites);
        }
        if (isAlive(stateStore)) {
          stateStore.setState('done');
        }
      } catch (err) {
        logger.error('fetch error', id, err);
        if (isAlive(stateStore)) {
          stateStore.setState('error');
        }
      }
    }),
    addItem(item) {
      self.items.push(item);
    },
    removeItem(item) {
      const items = self.items.slice(0);
      const pos = items.indexOf(item);
      if (pos !== -1) {
        items.splice(pos, 1);
        self.items = items;
      }
    },
    moveItem(index, prevIndex, nextIndex) {
      const items = self.items.slice(0);
      const item = items[index];
      const prevItem = items[prevIndex];
      const nextItem = items[nextIndex];

      items.splice(index, 1);

      if (prevItem) {
        const pos = items.indexOf(prevItem);
        if (pos !== -1) {
          items.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = items.indexOf(nextItem);
        if (pos !== -1) {
          items.splice(pos, 0, item);
        }
      } else {
        items.push(item);
      }

      self.items = items;

      return self.saveItems();
    },
  };
}).views(self => {
  return {
    saveItems() {
      return oneLimit(() => {
        return storageSet({
          explorerFavorites: self.getItemsSnapshot()
        });
      });
    }
  };
});

export default ExplorerFavoritesSectionStore;