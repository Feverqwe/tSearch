import {types, getSnapshot} from "mobx-state-tree";
import TrackerWorker from "../tools/trackerWorker";

/**
 * @typedef {{}} TrackerM
 * Model:
 * @property {string} id
 * @property {TrackerMetaM} meta
 * @property {TrackerInfoM} info
 * @property {string} code
 * Actions:
 * Views:
 * @property {function:string} getIconUrl
 * @property {function:TrackerWorker} getWorker
 * @property {function} destroyWorker
 */

/**
 * @typedef {{}} TrackerMetaM
 * Model:
 * @property {string} name
 * @property {string} version
 * @property {string} [author]
 * @property {string} [description]
 * @property {string} [homepageURL]
 * @property {string} [icon]
 * @property {string} [icon64]
 * @property {string} [trackerURL]
 * @property {string} [updateURL]
 * @property {string} [downloadURL]
 * @property {string} [supportURL]
 * @property {string[]} require
 * @property {string[]} connect
 * Actions:
 * Views:
 */

/**
 * @typedef {{}} TrackerInfoM
 * Model:
 * @property {number} lastUpdate
 * @property {boolean} disableAutoUpdate
 * Actions:
 * Views:
 */


const trackerMetaModel = types.model('trackerMetaModel', {
  name: types.string,
  version: types.string,
  author: types.maybe(types.string),
  description: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  icon: types.maybe(types.string),
  icon64: types.maybe(types.string),
  trackerURL: types.maybe(types.string),
  updateURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
  supportURL: types.maybe(types.string),
  require: types.optional(types.array(types.string), []),
  connect: types.array(types.string),
});

const trackerModel = types.model('trackerModel', {
  id: types.identifier(types.string),
  meta: trackerMetaModel,
  info: types.model('trackerInfo', {
    lastUpdate: types.optional(types.number, 0),
    disableAutoUpdate: types.optional(types.boolean, false),
  }),
  code: types.string,
}).actions(/**TrackerM*/self => {
  return {};
}).views(/**TrackerM*/self => {
  let worker = null;

  return {
    getWorker() {
      if (!worker) {
        worker = new TrackerWorker(getSnapshot(self));
      }
      return worker;
    },
    destroyWorker() {
      if (worker) {
        worker.destroy();
        worker = null;
      }
    },
    getIconUrl() {
      if (self.meta.icon64) {
        return self.meta.icon64;
      } else
      if (self.meta.icon) {
        return self.meta.icon;
      }
      return '';
    },
    beforeDestroy() {
      this.destroyWorker();
    },
  };
});

export default trackerModel;