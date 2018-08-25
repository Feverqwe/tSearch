import {types, resolveIdentifier, isAlive} from "mobx-state-tree";
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} ResultPageItemStore
 * @property {string} id
 * @property {string} trackerId
 * @property {string} title
 * @property {*} titleHighlightMap
 * @property {string} url
 * @property {*} rate
 * @property {number} quality
 * @property {number|undefined|null} categoryId
 * @property {string|undefined|null} categoryTitle
 * @property {string|undefined|null} categoryUrl
 * @property {number|undefined|null} size
 * @property {string|undefined|null} downloadUrl
 * @property {number|undefined|null} seed
 * @property {number|undefined|null} peer
 * @property {number|undefined|null} date
 * @property {string} dateTitle
 * @property {string} dateText
 * @property {string} sizeText
 * @property {*} tracker
 */
const ResultPageItemStore = types.model('ResultPageItemStore', {
  id: types.identifier,
  trackerId: types.string,
  title: types.string,
  titleHighlightMap: types.frozen(),
  url: types.string,
  rate: types.frozen(),
  quality: types.number,
  categoryId: types.maybeNull(types.number),
  categoryTitle: types.maybeNull(types.string),
  categoryUrl: types.maybeNull(types.string),
  size: types.maybeNull(types.number),
  downloadUrl: types.maybeNull(types.string),
  seed: types.maybeNull(types.number),
  peer: types.maybeNull(types.number),
  date: types.maybeNull(types.number),
  dateTitle: types.string,
  dateText: types.string,
  sizeText: types.string,
}).views(self => {
  return {
    get titleLowerCase() {
      return self.title.toLowerCase();
    },
    get categoryTitleLowerCase() {
      return self.categoryTitle.toLowerCase();
    },
    get tracker() {
      if (!isAlive(self)) {
        return null;
      } else {
        return resolveIdentifier(TrackerStore, self, self.trackerId);
      }
    }
  };
});

export default ResultPageItemStore;