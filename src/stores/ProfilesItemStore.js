import {types} from 'mobx-state-tree';


/**
 * @typedef {{}} ProfilesItemTrackerStore
 * @property {integer} id
 */
const ProfilesItemTrackerStore = types.model('ProfilesItemTrackerStore', {
  id: types.integer,
});


/**
 * @typedef {{}} ProfilesItemStore
 * @property {integer} id
 * @property {string} name
 * @property {ProfilesItemTrackerStore[]} trackers
 */
const ProfilesItemStore = types.model('ProfilesItemStore', {
  id: types.integer,
  name: types.string,
  trackers: types.array(ProfilesItemTrackerStore)
});

export default ProfilesItemStore;