import {getParent, types} from "mobx-state-tree";
import getTrackersJson from "../tools/getTrackersJson";
import promisifyApi from "../tools/promisifyApi";
import _unic from "lodash.uniq";

const debug = require('debug')('profileEditorModel');

/**
 * @typedef {{}} ProfileEditorM
 * Model:
 * @property {string} state
 * Actions:
 * @property {function(Object)} assign
 * Views:
 * @property {function:Promise} loadAllTrackers
 */

const profileEditorModel = types.model('profileEditorModel', {
  state: types.optional(types.string, 'idle'),
}).actions(/**ProfileEditorM*/self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
  };
}).views(/**ProfileEditorM*/self => {
  return {
    loadAllTrackers() {
      const /**IndexM*/indexModel = getParent(self, 1);
      return promisifyApi('chrome.storage.local.get')(null).then(storage => {
        return Object.keys(storage).filter(key => /^trackerModule_/.test(key)).map(key => /^trackerModule_(.+)$/.exec(key)[1]);
      }).then(storageTrackerIds => {
        return getTrackersJson().then(trackers => {
          return _unic([...storageTrackerIds, ...Object.keys(trackers)]);
        });
      }).then(trackerIds => {
        return Promise.all(trackerIds.map(id => {
          indexModel.initTrackerModule(id);
          return indexModel.getTrackerModel(id).readyPromise;
        }));
      }).then(() => {
        const trackerIds = [];
        indexModel.profiles.forEach(profile => {
          profile.trackers.forEach(trackerTemplate => {
            const tracker = trackerTemplate.getModule();
            if (!trackerIds.includes(tracker.id)) {
              trackerIds.push(tracker.id);
            }
          });
        });
        return Promise.all(trackerIds.map(id => {
          return indexModel.getTrackerModel(id).readyPromise;
        }));
      });
    },
    afterCreate() {
      self.assign({state: 'loading'});
      self.loadAllTrackers().then(() => {
        self.assign({state: 'done'});
      }).catch(err => {
        debug('loadAllTrackers error', err);
      });
    },
  };
});

export default profileEditorModel;