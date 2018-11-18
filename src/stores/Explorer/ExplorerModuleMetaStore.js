import {types} from "mobx-state-tree";
import ExplorerModuleMetaActionStore from "./ExplorerModuleMetaActionStore";
import getLocale from "../../tools/getLocale";
import processLocale from "../../tools/processLocale";

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

export default ExplorerModuleMetaStore;