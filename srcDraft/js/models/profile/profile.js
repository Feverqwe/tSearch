import profileTrackerModel from './profileTracker';
import {types} from "mobx-state-tree";

/**
 * @typedef {{}} ProfileM
 * Model:
 * @property {string} name
 * @property {ProfileTrackerM[]} trackers
 * Actions:
 * Views:
 * @property {string} state
 * @property {function:ProfileTrackerM[]} getSelectedProfileTrackers
 * @property {function:TrackerM[]} getTrackers
 * @property {function} start
 * @property {function} stop
 */

const profileModel = types.model('profileModel', {
  name: types.identifier(types.string),
  trackers: types.optional(types.array(profileTrackerModel), []),
}).actions(/**ProfileM*/self => {
  return {

  };
}).views(/**ProfileM*/self => {
  return {
    get readyPromise() {
      return Promise.all(self.trackers.map(profileTracker => profileTracker.readyPromise));
    },
    selectTracker(trackerId) {
      self.trackers.forEach(profileTracker => {
        if (trackerId === profileTracker.id) {
          profileTracker.toggleSelect();
        } else {
          profileTracker.setSelected(false);
        }
      });
    },
    getSelectedProfileTrackers() {
      let result = self.trackers.filter(a => a.selected);
      if (result.length === 0) {
        result = self.trackers;
      }
      return result;
    },
  };
});

export default profileModel;