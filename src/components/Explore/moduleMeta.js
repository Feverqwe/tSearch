import getLocale from "../../tools/getLocale";
import {types} from "mobx-state-tree";
import processLocale from "../../tools/processLocale";
import exploreModuleMetaActionModel from "./moduleMetaAction";

/**
 * @typedef {{}} ExploreModuleMetaM
 * Model:
 * @property {string} name
 * @property {string} version
 * @property {string} [author]
 * @property {string} [description]
 * @property {string} [homepageURL]
 * @property {string} [icon]
 * @property {string} [icon64]
 * @property {string} [siteURL]
 * @property {string} [downloadURL]
 * @property {string} [supportURL]
 * @property {string[]} require
 * @property {string[]} connect
 * @property {ExploreModuleMetaActionM[]} actions
 * @property {Object<string,Object<string,string>>} locales
 * @property {string} defaultLocale
 * @property {Object<string,string>} locale
 * Actions:
 * Views:
 * @property {function:Object} getLocale
 * @property {function:string} getName
 */

const exploreModuleMetaModel = types.model('exploreModuleMetaModel', {
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
  require: types.optional(types.array(types.string), []),
  connect: types.array(types.string),
  actions: types.optional(types.array(exploreModuleMetaActionModel), []),
  locales: types.frozen,
  defaultLocale: types.maybe(types.string),
}).actions(/**ExploreModuleMetaM*/self => {
  return {};
}).views(/**ExploreModuleMetaM*/self => {
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

export default exploreModuleMetaModel;