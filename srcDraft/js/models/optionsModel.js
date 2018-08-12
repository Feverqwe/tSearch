import {getSnapshot, types} from "mobx-state-tree";
import getLogger from "../../../src/tools/getLogger";

const debug = getLogger('optionsModel');
const promiseLimit = require('promise-limit');

const oneLimit = promiseLimit(1);

const defaultOptions = {
  sortByList: [{by: 'quality'}]
};

const optionModelMap = {
  sortByList: types.frozen,
};

const optionsKeys = Object.keys(defaultOptions);

const optionsModel = types.model('optionsModel', Object.assign({
  state: types.optional(types.string, 'idle'), // idle, loading, ready, error
  options: types.optional(types.model(optionsKeys.reduce((obj, key) => {
    obj[key] = optionModelMap[key];
    return obj;
  }, {})), {}),
})).actions(self => {
  return {
    assign(obj) {
      Object.assign(self, obj);
    },
    set(key, value) {
      self.options[key] = value;
      return self.save();
    },
    get(key) {
      return self.options[key];
    }
  };
}).views(self => {
  let readyPromise = null;

  const handleStorageListener = (changes, namespace) => {
    if (namespace === 'sync') {
      optionsKeys.forEach(key => {
        const change = changes[key];
        if (change) {
          self.set(key, change.newValue);
        }
      });
    }
  };

  return {
    save() {
      return oneLimit(() => {
        const storage = getSnapshot(self.options);
        return new Promise(resolve => chrome.storage.sync.set(storage, resolve));
      });
    },
    get readyPromise() {
      return readyPromise;
    },
    afterCreate() {
      self.assign({state: 'loading'});
      readyPromise = new Promise(resolve => chrome.storage.sync.get(defaultOptions, resolve)).then(options => {
        self.assign({options});
        chrome.storage.onChanged.addListener(handleStorageListener);
        self.assign({state: 'ready'});
      }).catch(err => {
        debug('afterCreate error', err);
        self.assign({state: 'error'});
      });
    },
    beforeDestroy() {
      chrome.storage.onChanged.removeListener(handleStorageListener);
    }
  };
}).create();

export default optionsModel;