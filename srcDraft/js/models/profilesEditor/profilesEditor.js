import {destroy, getParent, getRoot, getSnapshot, types} from "mobx-state-tree";
import getTrackersJson from "../../../../src/tools/getTrackersJson";
import promisifyApi from "../../../../src/tools/promisifyApi";
import _unic from "lodash.uniq";
import profilesEditorProfileModel from "./profilesEditorProfile";
import getLogger from "../../../../src/tools/getLogger";

const debug = getLogger('profilesEditorModel');

/**
 * @typedef {{}} ProfilesEditorM
 * Model:
 * @property {string} state
 * @property {ProfilesEditorProfileM[]} profiles
 * Actions:
 * @property {function(Object)} assign
 * @property {function(ProfilesEditorProfileM)} removeProfile
 * Views:
 * @property {function(string):ProfilesEditorProfileM} getProfileByName
 * @property {function:Promise} save
 * @property {function:Promise} initAllTrackers
 * @property {function:Promise} loadAllTrackers
 * @property {function(number,number,number)} moveProfile
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
        self.assign({state: 'error'});
      });
    },
    getProfileByName(name) {
      let result = null;
      self.profiles.some(profile => {
        if (profile.name === name) {
          result = profile;
          return true;
        }
      });
      return result;
    },
    save() {
      /**@type IndexM*/
      const indexModel = getRoot(self);
      indexModel.setProfiles(getSnapshot(self.profiles));
      let currentProfileName = indexModel.profile.name;
      if (!self.getProfileByName(currentProfileName)) {
        if (self.profiles.length) {
          currentProfileName = self.profiles[0].name;
        }
      }
      indexModel.setProfile(currentProfileName);
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