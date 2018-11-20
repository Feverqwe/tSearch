import {clone, getParent, getParentOfType, types} from "mobx-state-tree";
import ExplorerStore from "./ExplorerStore";

/**
 * @typedef {{}} ExplorerItemStore
 * @property {string} title
 * @property {string|undefined} titleOriginal
 * @property {string} url
 * @property {string|undefined} poster
 * @property {*} extra
 * @property {function} updateProps
 * @property {function} addFavorite
 * @property {function} removeFavorite
 */
const ExplorerItemStore = types.model('ExplorerItemStore', {
  title: types.string,
  titleOriginal: types.maybe(types.string),
  url: types.string,
  poster: types.maybe(types.string),
  extra: types.frozen(),
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
  };
});

export default ExplorerItemStore;