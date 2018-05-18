const debug = require('debug')('loadTrackers');
import getTrackerCodeMeta from "./getTrackerCodeMeta";


const loadTrackerModule = id => {
  return fetch('./trackers/' + id + '.js').then(response => {
    return response.text();
  }).then(response => {
    return {
      id: id,
      meta: getTrackerCodeMeta(response),
      code: response,
    }
  }).catch(function (err) {
    debug('Load tracker error', err);
  });
};

export default loadTrackerModule;