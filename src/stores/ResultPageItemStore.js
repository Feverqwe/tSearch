import {types} from "mobx-state-tree";


/**
 * @typedef {{}} ResultPageItemStore
 * @property {string} id
 * @property {string} trackerId
 * @property {string} title
 * @property {string} titleLowerCase
 * @property {*} titleHighlightMap
 * @property {string} url
 * @property {*} rate
 * @property {number} quality
 * @property {number|undefined|null} categoryId
 * @property {string|undefined|null} categoryTitle
 * @property {string} categoryTitleLowerCase
 * @property {string|undefined|null} categoryUrl
 * @property {number|undefined|null} size
 * @property {string|undefined|null} downloadUrl
 * @property {number|undefined|null} seeds
 * @property {number|undefined|null} peers
 * @property {number|undefined|null} date
 * @property {string} dateTitle
 * @property {string} dateText
 * @property {string} sizeText
 */
const ResultPageItemStore = types.model('ResultPageItemStore', {
  trackerId: types.string,
  title: types.string,
  titleLowerCase: types.string,
  titleHighlightMap: types.frozen(),
  url: types.string,
  rate: types.frozen(),
  quality: types.number,
  categoryId: types.maybeNull(types.number),
  categoryTitle: types.maybeNull(types.string),
  categoryTitleLowerCase: types.string,
  categoryUrl: types.maybeNull(types.string),
  size: types.maybeNull(types.number),
  downloadUrl: types.maybeNull(types.string),
  seeds: types.maybeNull(types.number),
  peers: types.maybeNull(types.number),
  date: types.maybeNull(types.number),
  dateTitle: types.string,
  dateText: types.string,
  sizeText: types.string,
});

export default ResultPageItemStore;