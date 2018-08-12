import getLogger from "./getLogger";
import getTrackerCodeMeta from "./getTrackerCodeMeta";

const debug = getLogger('loadTrackers');

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