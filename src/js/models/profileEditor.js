import {getParent, types} from "mobx-state-tree";
import getTrackersJson from "../tools/getTrackersJson";
import promisifyApi from "../tools/promisifyApi";
import _unic from "lodash.uniq";

const debug = require('debug')('profileEditorModel');

/**
 * @typedef {{}} ProfileEditorM
 * Model:
 * Actions:
 * Views:
 */

const profileEditorModel = types.model('profileEditorModel', {
  state: types.optional(types.string, 'idle'),
}).actions(/**PageM*/self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
  };
}).views(self => {
  return {
    loadAllTrackers() {
      return promisifyApi('chrome.storage.local.get')(null).then(storage => {
        return Object.keys(storage).filter(key => /^trackerModule_/.test(key)).map(key => /^trackerModule_(.+)$/.exec(key)[1]);
      }).then(storageTrackerIds => {
        return getTrackersJson().then(trackers => {
          return _unic([...storageTrackerIds, ...Object.keys(trackers)]);
        });
      }).then(trackerIds => {
        const indexModel = /**IndexM*/getParent(self, 1);
        return Promise.all(trackerIds.map(id => {
          if (!indexModel.trackers.has(id)) {
            indexModel.putTrackerModule({id});
          }
          return indexModel.trackers.get(id).readyPromise;
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