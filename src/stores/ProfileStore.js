import {types} from 'mobx-state-tree';
import TrackerStore from "./TrackerStore";


/**
 * @typedef {{}} ProfileStore
 * @property {string} id
 * @property {string} name
 * @property {TrackerStore[]} trackers
 */
const ProfileStore = types.model('ProfileStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(TrackerStore)
});

export default ProfileStore;