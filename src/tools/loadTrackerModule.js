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
  });
};

export default loadTrackerModule;