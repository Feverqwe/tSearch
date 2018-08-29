import getTrackerCodeMeta from "./getTrackerCodeMeta";

const loadLocalTrackerModule = id => {
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

export default loadLocalTrackerModule;