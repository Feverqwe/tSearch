import {types} from 'mobx-state-tree';


/**
 * @typedef {{}} ProfilesTrackerStore
 * @property {string} id
 */
const ProfilesTrackerStore = types.model('ProfilesTrackerStore', {
  id: types.string,
});


/**
 * @typedef {{}} ProfilesItemStore
 * @property {string} id
 * @property {string} name
 * @property {ProfilesTrackerStore[]} trackers
 */
const ProfilesItemStore = types.model('ProfilesItemStore', {
  id: types.identifier,
  name: types.string,
  trackers: types.array(ProfilesTrackerStore)
});

export default ProfilesItemStore;