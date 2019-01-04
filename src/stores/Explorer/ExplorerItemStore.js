import {clone, getParent, getParentOfType, resolveIdentifier, types} from "mobx-state-tree";
import ExplorerStore from "./ExplorerStore";
import RootStore from "../RootStore";
import {ExplorerQuickSearchItemStore} from "./ExplorerQuickSearchStore";
import getNow from "../../tools/getNow";

/**
 * @typedef {{}} ExplorerItemStore
 * @property {string} title
 * @property {string|undefined} titleOriginal
 * @property {string} url
 * @property {string|undefined} poster
 * @property {function} updateProps
 * @property {function} addFavorite
 * @property {function} removeFavorite
 * @property {*} localTitle
 * @property {*} query
 * @property {*} quickSearchItem
 * @property {function} quickSearch
 */
const ExplorerItemStore = types.model('ExplorerItemStore', {
  title: types.string,
  titleOriginal: types.maybe(types.string),
  url: types.string,
  poster: types.maybe(types.string),
}).actions(/**ExplorerItemStore*/self => {
  return {
    updateProps(props) {
      Object.assign(self, props);

      const favoritesSectionStore = /**ExplorerFavoritesSectionStore*/getParent(self, 2);
      return favoritesSectionStore.saveItems();
    }
  };
}).views(/**ExplorerItemStore*/self => {
  return {
    addFavorite() {
      const explorerStore = /**ExplorerStore*/getParentOfType(self, ExplorerStore);
      explorerStore.favoritesSection.addItem(clone(self));
      explorerStore.favoritesSection.saveItems();
    },
    removeFavorite() {
      const favoritesSectionStore = /**ExplorerFavoritesSectionStore*/getParent(self, 2);
      favoritesSectionStore.removeItem(self);
      favoritesSectionStore.saveItems();
    },
    get localTitle() {
      /**@type RootStore*/
      const rootStore = getParentOfType(self, RootStore);
      let title = null;
      if (rootStore.options.options.originalPosterName) {
        title = self.titleOriginal || self.title;
      } else {
        title = self.title;
      }
      return title;
    },
    get query() {
      return this.localTitle;
    },
    get quickSearchItem() {
      return resolveIdentifier(ExplorerQuickSearchItemStore, self, self.query);
    },
    quickSearch() {
      if (!self.quickSearchItem) {
        /**@type ExplorerStore*/
        const explorerStore = getParentOfType(self, ExplorerStore);
        explorerStore.quickSearch.addItem({
          query: self.query,
          time: getNow()
        });
      }
      self.quickSearchItem.search();
    }
  };
});

export default ExplorerItemStore;