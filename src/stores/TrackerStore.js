import {types} from 'mobx-state-tree';


/**
 * @typedef {{}} TrackerStore
 * @property {string} id
 */
const TrackerStore = types.model('TrackerStore', {
  id: types.identifier,
});

export default TrackerStore;