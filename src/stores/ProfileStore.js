import {isAlive, resolveIdentifier, types} from 'mobx-state-tree';
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} ProfileTrackerMetaStore
 * @property {string|undefined} name
 * @property {string|undefined} author
 * @property {string|undefined} homepageURL
 * @property {string|undefined} trackerURL
 * @property {string|undefined} downloadURL
 */
const ProfileTrackerMetaStore = types.model('ProfileTrackerMetaStore', {
  name: types.maybe(types.string),
  author: types.maybe(types.string),
  homepageURL: types.maybe(types.string),
  trackerURL: types.maybe(types.string),
  downloadURL: types.maybe(types.string),
});

/**
 * @typedef {{}} ProfileTrackerOptionsStore
 * @property {boolean} [enableProxy]
 * @property {function} setEnableProxy
 */
const ProfileTrackerOptionsStore = types.model('ProfileTrackerOptionsStore', {
  enableProxy: types.optional(types.boolean, false),
}).actions((self) => {
  return {
    setEnableProxy(value) {
      self.enableProxy = value;
    }
  };
});

/**
 * @typedef {{}} ProfileTrackerStore
 * @property {string} id
 * @property {ProfileTrackerMetaStore} [meta]
 * @property {ProfileTrackerOptionsStore} [options]
 * @property {*} tracker
 */
const ProfileTrackerStore = types.model('ProfileTrackerStore', {
  id: types.string,
  meta: types.optional(ProfileTrackerMetaStore, {}),
  options: types.optional(ProfileTrackerOptionsStore, {}),
}).views(self => {
  return {
    get tracker() {
      if (isAlive(self)) {
        return resolveIdentifier(TrackerStore, self, self.id);
      }
    }
  };
});

/**
 * @typedef {{}} ProfileStore
 * @property {string} id
 * @property {string} name
 * @property {ProfileTrackerStore[]} trackers
 */
const ProfileStore = types.model('ProfileStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(ProfileTrackerStore)
});

export default ProfileStore;
export {ProfileTrackerStore};