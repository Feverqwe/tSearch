import {getParent, getSnapshot, getRoot, types} from "mobx-state-tree";
import getTrackersJson from "../../tools/getTrackersJson";
import promisifyApi from "../../tools/promisifyApi";
import _unic from "lodash.uniq";
import profilesEditorProfileModel from "./profilesEditorProfile";

const debug = require('debug')('profilesEditorModel');

/**
 * @typedef {{}} ProfilesEditorM
 * Model:
 * @property {string} state
 * @property {ProfileTemplateM[]} profiles
 * Actions:
 * @property {function(Object)} assign
 * @property {function(ProfileTemplateM)} removeProfile
 * Views:
 * @property {function:Promise} initAllTrackers
 * @property {function:Promise} loadAllTrackers
 */

const profilesEditorModel = types.model('profilesEditorModel', {
  state: types.optional(types.string, 'idle'),
  profiles: types.array(profilesEditorProfileModel),
}).actions(/**ProfilesEditorM*/self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
    createProfile() {
      const newProfile = profilesEditorProfileModel.create();
      self.profiles.push(newProfile);
      return newProfile;
    },
    removeProfile(profile) {
      destroy(profile);
    },
  };
}).views(/**ProfilesEditorM*/self => {
  return {
    afterCreate() {
      self.assign({state: 'loading'});
      self.loadAllTrackers().then(() => {
        self.assign({state: 'done'});
      }).catch(err => {
        debug('loadAllTrackers error', err);
      });
    },
    save() {
      /**@type IndexM*/
      const indexModel = getRoot(self);
      indexModel.setProfiles(getSnapshot(self.profiles));
      indexModel.setProfile(indexModel.profile.name);
      return indexModel.saveProfiles();
    },
    initAllTrackers() {
      const /**IndexM*/indexModel = getParent(self, 1);
      return promisifyApi('chrome.storage.local.get')(null).then(storage => {
        return Object.keys(storage).filter(key => /^trackerModule_/.test(key)).map(key => /^trackerModule_(.+)$/.exec(key)[1]);
      }).then(storageTrackerIds => {
        return getTrackersJson().then(trackers => {
          return _unic([...storageTrackerIds, ...Object.keys(trackers)]);
        });
      }).then(trackerIds => {
        trackerIds.forEach(id => {
          indexModel.initTrackerModule(id);
        });
      });
    },
    loadAllTrackers() {
      const /**IndexM*/indexModel = getParent(self, 1);
      return self.initAllTrackers().then(() => {
        return Promise.all(indexModel.getTrackerModules().map(tracker => tracker.readyPromise));
      });
    },
    moveProfile(index, prevIndex, nextIndex) {
      const profiles = self.profiles.slice(0);
      const item = profiles[index];
      const prevItem = profiles[prevIndex];
      const nextItem = profiles[nextIndex];

      profiles.splice(index, 1);

      if (prevItem) {
        const pos = profiles.indexOf(prevItem);
        if (pos !== -1) {
          profiles.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = profiles.indexOf(nextItem);
        if (pos !== -1) {
          profiles.splice(pos, 0, item);
        }
      } else {
        profiles.push(item);
      }

      self.assign({profiles});
    },
  };
});

export default profilesEditorModel;