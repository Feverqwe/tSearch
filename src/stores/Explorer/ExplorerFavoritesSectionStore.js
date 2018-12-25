import {flow, isAlive, types} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";
import ExplorerSectionStore from "./ExplorerSectionStore";
import storageGet from "../../tools/storageGet";
import storageSet from "../../tools/storageSet";
import _isEqual from "lodash.isequal";

const promiseLimit = require('promise-limit');

const logger = getLogger('ExplorerFavoritesSectionStore');
const oneLimit = promiseLimit(1);

/**
 * @typedef {ExplorerSectionStore} ExplorerFavoritesSectionStore
 * @property {null} moduleId
 * @property {function} setState
 * @property {function:Promise} fetchData
 * @property {function} addItem
 * @property {function} removeItem
 * @property {function} moveItem
 * @property {function} saveItems
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const ExplorerFavoritesSectionStore = types.compose('ExplorerFavoritesSectionStore', ExplorerSectionStore, types.model({
  moduleId: types.maybe(types.string),
})).actions(self => {
  return {
    setState(state) {
      self.state = state;
    },
    fetchData: flow(function* () {
      const id = self.id;
      self.setState('pending');
      try {
        const storage = yield storageGet({
          explorerFavorites: [],
        }, 'sync');
        if (isAlive(self)) {
          self.setItems(storage.explorerFavorites);
          self.setState('done');
        }
      } catch (err) {
        logger.error('fetch error', id, err);
        if (isAlive(self)) {
          self.setState('self');
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
    },
  };
}).views(self => {
  const storageChangeListener = (changes, namespace) => {
    if (!isAlive(self)) return;
    if (self.state !== 'done') return;

    if (namespace === 'sync') {
      const change = changes.explorerFavorites;
      if (change) {
        const explorerFavorites = change.newValue || [];
        if (!_isEqual(explorerFavorites, self.getItemsSnapshot())) {
          self.setItems(explorerFavorites);
        }
      }
    }
  };

  return {
    saveItems() {
      return oneLimit(() => {
        return storageSet({
          explorerFavorites: self.getItemsSnapshot()
        }, 'sync');
      });
    },
    afterCreate() {
      chrome.storage.onChanged.addListener(storageChangeListener);
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(storageChangeListener);
    },
  };
});

export default ExplorerFavoritesSectionStore;