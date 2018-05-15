const debug = require('debug')('loadExploreSections');
import getExploreSectionCodeMeta from "./getExploreSectionCodeMeta";


const loadExploreModule = id => {
  return fetch('./exploreSections/' + id + '.js').then(response => {
    return response.text();
  }).then(response => {
    return {
      id: id,
      meta: getExploreSectionCodeMeta(response),
      info: {
        lastUpdate: 0,
        disableAutoUpdate: false,
      },
      code: response,
    };
  }).catch(function (err) {
    debug('Load explore section error', err);
  });
};

export default loadExploreModule;