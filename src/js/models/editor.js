import {types} from "mobx-state-tree";
import trackerModel from "./tracker";

const qs = require('querystring');
const debug = require('debug')('editorModel');

/**
 * @typedef {{}} EditorM
 * Model:
 * @property {string} state
 * @property {TrackerM} module
 * Actions:
 * @property {function(Object)} assign
 * Views:
 * @property {Promise} readyPromise
 * @property {function(RegExp):Array} getTitleHighlightMap
 */

const editorModel = types.model('editorModel', {
  state: types.optional(types.string, 'idle'), // idle, loading, done
  module: types.maybe(trackerModel),
}).actions(/**EditorM*/self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
  };
}).views(/**EditorM*/self => {
  let readyPromise = null;

  return {
    get readyPromise() {
      return readyPromise;
    },
    afterCreate() {
      self.assign({state: 'loading'});
      const uri = new URL(location.href);
      const query = qs.parse(uri.hash.substr(1));
      self.assign({module: trackerModel.create({
        moduleType: 'tracker',
        id: query.trackerId
      })});
      return readyPromise = self.module.readyPromise.catch(err => {
        debug('afterCreate error', err);
      }).then(() => {
        self.assign({state: 'done'});
      });
    }
  };
});

export default editorModel;