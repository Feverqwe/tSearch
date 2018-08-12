import {types, destroy} from "mobx-state-tree";
import trackerModel from "./tracker";
import getLogger from "../../../src/tools/getLogger";

const qs = require('querystring');

const debug = getLogger('editorModel');

/**
 * @typedef {{}} EditorM
 * Model:
 * @property {string} state
 * @property {TrackerM} module
 * Actions:
 * @property {function(Object)} assign
 * Views:
 * @property {Promise} readyPromise
 * @property {function(string)} loadTracker
 * @property {function} destroy
 */

const editorModel = types.model('editorModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, done
  module: types.union(snapshot => {
    switch (snapshot.moduleType) {
      case 'tracker': {
        return trackerModel;
      }
    }
  }, trackerModel),
}).actions(/**EditorM*/self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
    setModule(obj) {
      self.module = obj;
    }
  };
}).views(/**EditorM*/self => {
  let readyPromise = null;

  return {
    get readyPromise() {
      return readyPromise;
    },
    afterCreate() {
      self.assign({state: 'loading'});
      return readyPromise = self.module.readyPromise.catch(err => {
        debug('afterCreate error', err);
      }).then(() => {
        self.assign({state: 'done'});
      });
    },
    destroy() {
      destroy(self);
    }
  };
});

export default editorModel;