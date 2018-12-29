import storageGet from "../tools/storageGet";
import getNow from "../tools/getNow";
import storageSet from "../tools/storageSet";
import getLogger from "./getLogger";

const logger = getLogger('tracker');

class Tracker {
  init() {
    storageGet('initTimeout').then(({initTimeout}) => {
      if (initTimeout > getNow()) {
        // logger.debug('init skip cause: TIMEOUT');
        return;
      }
      return storageSet({initTimeout: getNow() + 5 * 60}).then(() => {
        return track({
          t: 'screenview',
          cd: 'init',
        }).then(() => {
          return storageSet({initTimeout: getNow() + 86400});
        }, err => {
          logger.error('init error', err);
        });
      });
    });
  }
  track(params) {
    track(params).catch(err => {
      logger.error('track error', err);
    });
  }
}

const track = params => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(Object.assign({
      action: 'track',
      params: params,
    }), response => {
      if (!response) {
        return reject(new Error('Unknown error'));
      }
      if (response.error) {
        const err = new Error();
        Object.assign(err, response.error);
        return reject(err);
      }
      resolve();
    });
  });
};

const tracker = new Tracker();

export default tracker;