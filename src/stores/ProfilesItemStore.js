import {types} from 'mobx-state-tree';


/**
 * @typedef {{}} ProfilesItemTrackerStore
 * @property {string} id
 */
const ProfilesItemTrackerStore = types.model('ProfilesItemTrackerStore', {
  id: types.string,
});


/**
 * @typedef {{}} ProfilesItemStore
 * @property {string} id
 * @property {string} name
 * @property {ProfilesItemTrackerStore[]} trackers
 */
const ProfilesItemStore = types.model('ProfilesItemStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(ProfilesItemTrackerStore)
});

export default ProfilesItemStore;