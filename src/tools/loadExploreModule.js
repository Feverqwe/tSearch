import getLogger from "./getLogger";
import getExploreSectionCodeMeta from "./getExploreSectionCodeMeta";

const debug = getLogger('loadExploreSections');

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