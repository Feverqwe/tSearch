import {clone, getParent, getRoot, types} from "mobx-state-tree";

/**
 * @typedef {{}} ExploreSectionItemM
 * Model:
 * @property {string} title
 * @property {string} titleOriginal
 * @property {string} url
 * @property {string} poster
 * @property {Object} extra
 * Actions:
 * Views:
 * @property {function} handleAddFavorite
 * @property {function} handleEditFavorite
 * @property {function} handlePostMoveFavorite
 * @property {function} handleRemoveFavorite
 */

const sectionItemMode = types.model('sectionItemMode', {
  title: types.string,
  titleOriginal: types.maybe(types.string),
  url: types.string,
  poster: types.maybe(types.string),
  extra: types.frozen,
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

export default sectionItemMode;