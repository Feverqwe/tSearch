import {clone, getParent, getRoot, types} from "mobx-state-tree";

/**
 * @typedef {{}} ExplorerItemStore
 * @property {string} title
 * @property {string|undefined} titleOriginal
 * @property {string} url
 * @property {string|undefined} poster
 * @property {*} extra
 * @property {function} updateProps
 * @property {function} handleAddFavorite
 * @property {function} handleRemoveFavorite
 */
const ExplorerItemStore = types.model('ExplorerItemStore', {
  title: types.string,
  titleOriginal: types.maybe(types.string),
  url: types.string,
  poster: types.maybe(types.string),
  extra: types.frozen(),
}).actions(/**ExploreSectionItemM*/self => {
  return {
    updateProps(props) {
      Object.assign(self, props);

      const module = getParent(self, 2);
      return module.saveItems();
    }
  };
}).views(/**ExploreSectionItemM*/self => {
  return {
    handleAddFavorite(e) {
      e.preventDefault();
      const explore = /**ExploreM*/getRoot(self);
      explore.favouriteModule.addItem(clone(self));
    },
    handleRemoveFavorite(e) {
      e.preventDefault();
      const explore = /**ExploreM*/getRoot(self);
      explore.favouriteModule.removeItem(self);
    },
  };
});

export default ExplorerItemStore;