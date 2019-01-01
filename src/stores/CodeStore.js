import {types} from "mobx-state-tree";
import {isNumber, isString} from "../tools/assertType";

/**
 * @typedef {{}} MethodStore
 * @property {string} name
 * @property {*[]} args
 * @property {function} setArgs
 * @property {function} getSnapshot
 */
const MethodStore = types.model('MethodStore', {
  name: types.string,
  args: types.array(types.frozen()),
}).actions(self => {
  return {
    setArgs(args) {
      self.args = args;
    }
  };
}).views((self) => {
  return {
    getSnapshot() {
      const result = getSnapshot(self);
      if (!result.args.length) {
        delete result.args;
      }
      return result;
    }
  };
});

/**
 * @typedef {{}} StringSelectorStore
 * @property {string} selector
 * @property {MethodStore[]} pipeline
 * @property {function} set
 * @property {function} addMethod
 * @property {function} removeMethod
 * @property {function} moveMethod
 * @property {function} verifyType
 * @property {function} getSnapshot
 */
const StringSelectorStore = types.model('StringSelectorStore', {
  selector: types.string,
  pipeline: types.array(MethodStore),
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
    addMethod(name, args) {
      self.pipeline.push({
        name, args
      });
    },
    removeMethod(method) {
      const pipeline = self.pipeline.slice(0);
      const pos = pipeline.indexOf(method);
      if (pos !== -1) {
        pipeline.splice(pos, 1);
        self.pipeline = pipeline;
      }
    },
    moveMethod(index, prevIndex, nextIndex) {
      const items = self.pipeline.slice(0);
      const item = items[index];
      const prevItem = items[prevIndex];
      const nextItem = items[nextIndex];

      items.splice(index, 1);

      if (prevItem) {
        const pos = items.indexOf(prevItem);
        if (pos !== -1) {
          items.splice(pos + 1, 0, item);
        }
      } else
      if (nextItem) {
        const pos = items.indexOf(nextItem);
        if (pos !== -1) {
          items.splice(pos, 0, item);
        }
      } else {
        items.push(item);
      }

      self.pipeline = items;
    }
  };
}).views((self) => {
  return {
    verifyType(value) {
      return isString(value);
    },
    getSnapshot() {
      const result = getSnapshot(self);
      if (!result.pipeline.length) {
        delete result.pipeline;
      }
      return result;
    }
  };
});

/**
 * @typedef {StringSelectorStore} NumberSelectorStore
 * @property {string} selector
 * @property {MethodStore[]} pipeline
 * @property {function} verifyType
 */
const NumberSelectorStore = types.compose('NumberSelectorStore', StringSelectorStore, types.model({
  selector: types.string,
  pipeline: types.array(MethodStore),
})).views((self) => {
  return {
    verifyType(value) {
      return isNumber(value);
    }
  };
});

/**
 * @typedef {{}} ElementSelectorStore
 * @property {string} selector
 * @property {function} set
 */
const ElementSelectorStore = types.model('ElementSelectorStore', {
  selector: types.string,
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
  };
});

/**
 * @typedef {{}} CodeSearchStore
 * @property {string} url
 * @property {string} [method]
 * @property {string} [baseUrl]
 * @property {string} [originUrl]
 * @property {string} [headers]
 * @property {string} [body]
 * @property {string} [encoding]
 * @property {string} [query]
 * @property {string} [charset]
 * @property {function} set
 * @property {function} getSnapshot
 */
const CodeSearchStore = types.model('CodeSearchStore', {
  url: types.string,
  method: types.optional(types.enumeration(['GET', 'POST']), 'GET'),
  baseUrl: types.optional(types.string, ''),
  originUrl: types.optional(types.string, ''),
  headers: types.optional(types.string, ''),
  body: types.optional(types.string, ''),
  encoding: types.optional(types.string, ''),
  query: types.optional(types.string, ''),
  charset: types.optional(types.string, ''),
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
  };
}).views((self) => {
  return {
    getSnapshot() {
      const result = getSnapshot(self);
      ['baseUrl', 'originUrl', 'headers', 'body', 'encoding', 'query', 'charset'].forEach((key) => {
        if (!result[key]) {
          delete result[key];
        }
      });
      return result;
    }
  };
});

/**
 * @typedef {{}} CodeAuthStore
 * @property {string} [url]
 * @property {ElementSelectorStore|undefined} loginForm
 * @property {function} set
 * @property {function} getSnapshot
 */
const CodeAuthStore = types.model('CodeAuthStore', {
  url: types.optional(types.string, ''),
  loginForm: types.maybe(ElementSelectorStore),
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
  };
}).views((self) => {
  return {
    getSnapshot() {
      const result = getSnapshot(self);
      if (!result.url) {
        delete result.url;
      }
      if (result.loginForm && !result.loginForm.selector) {
        delete result.loginForm;
      }
      return result;
    }
  };
});

/**
 * @typedef {{}} CodeSelectorsStore
 * @property {ElementSelectorStore} row
 * @property {number} [skipFromStart]
 * @property {number} [skipFromEnd]
 * @property {StringSelectorStore|undefined} categoryTitle
 * @property {StringSelectorStore|undefined} categoryUrl
 * @property {StringSelectorStore|undefined} categoryId
 * @property {StringSelectorStore} title
 * @property {StringSelectorStore} url
 * @property {NumberSelectorStore|undefined} size
 * @property {StringSelectorStore|undefined} downloadUrl
 * @property {NumberSelectorStore|undefined} seeds
 * @property {NumberSelectorStore|undefined} peers
 * @property {NumberSelectorStore|undefined} date
 * @property {StringSelectorStore|undefined} nextPageUrl
 * @property {function} set
 * @property {function} getDefaultPipeline
 * @property {function} getSnapshot
 */
const CodeSelectorsStore = types.model('CodeSelectorsStore', {
  row: ElementSelectorStore,
  skipFromStart: types.optional(types.number, 0),
  skipFromEnd: types.optional(types.number, 0),
  categoryTitle: types.maybe(StringSelectorStore),
  categoryUrl: types.maybe(StringSelectorStore),
  categoryId: types.maybe(StringSelectorStore),
  title: StringSelectorStore,
  url: StringSelectorStore,
  size: types.maybe(NumberSelectorStore),
  downloadUrl: types.maybe(StringSelectorStore),
  seeds: types.maybe(NumberSelectorStore),
  peers: types.maybe(NumberSelectorStore),
  date: types.maybe(NumberSelectorStore),
  nextPageUrl: types.maybe(StringSelectorStore),
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
  };
}).views(self => {
  return {
    getDefaultPipeline(id) {
      let pipeline = null;
      if (['seeds', 'peers'].indexOf(id) !== -1) {
        pipeline = [{
          name: 'getText'
        }, {
          name: 'toInt'
        }];
      } else
      if (['size'].indexOf(id) !== -1) {
        pipeline = [{
          name: 'getText'
        }, {
          name: 'parseSize'
        }];
      } else
      if (/Url$/.test(id)) {
        pipeline = [{
          name: 'getProp',
          args: ['href']
        }];
      } else {
        pipeline = [{
          name: 'getText'
        }];
      }
      return pipeline;
    },
    getSnapshot() {
      const result = getSnapshot(self);
      if (!result.skipFromStart) {
        delete result.skipFromStart;
      }
      if (!result.skipFromEnd) {
        delete result.skipFromEnd;
      }
      ['categoryTitle', 'categoryUrl', 'categoryId', 'size', 'downloadUrl', 'seeds', 'peers', 'date', 'nextPageUrl'].forEach((key) => {
        if (result[key] && !result[key].selector) {
          delete result[key];
        }
      });
      return result;
    }
  };
});

/**
 * @typedef {{}} CodeDescriptionStore
 * @property {string} icon
 * @property {string} name
 * @property {string} [url]
 * @property {string} [description]
 * @property {string} [downloadUrl]
 * @property {string} [version]
 * @property {function} set
 * @property {function} getSnapshot
 */
const CodeDescriptionStore = types.model('CodeDescriptionStore', {
  icon: types.string,
  name: types.string,
  url: types.optional(types.string, ''),
  description: types.optional(types.string, ''),
  downloadUrl: types.optional(types.string, ''),
  version: types.optional(types.string, '1.0'),
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
  };
}).views(self => {
  return {
    getSnapshot() {
      const result = getSnapshot(self);
      ['url', 'description', 'downloadUrl'].forEach((key) => {
        if (!result[key]) {
          delete result[key];
        }
      });
      return result;
    }
  };
});

/**
 * @typedef {{}} CodeStore
 * @property {string|undefined} id
 * @property {number} [version]
 * @property {string} [type]
 * @property {CodeSearchStore} search
 * @property {CodeAuthStore} [auth]
 * @property {CodeSelectorsStore} selectors
 * @property {CodeDescriptionStore} description
 * @property {function} getSnapshot
 */
const CodeStore = types.model('CodeStore', {
  id: types.maybe(types.string),
  version: types.optional(types.refinement(types.number, value => value === 3), 3),
  type: types.optional(types.refinement(types.string, value => value === 'kit'), 'kit'),
  description: CodeDescriptionStore,
  search: CodeSearchStore,
  auth: types.optional(CodeAuthStore, {}),
  selectors: CodeSelectorsStore,
}).views(self => {
  return {
    getSnapshot() {
      const result = getSnapshot(self);
      if (Object.keys(result.auth).length === 0) {
        delete result.auth;
      }
      return result;
    }
  };
});

const getSnapshot = (value, level = 0) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'object') {
    return JSON.parse(JSON.stringify(value));
  }

  if (Array.isArray(value)) {
    return value.map(value => getSnapshot(value, level + 1));
  }

  if (level > 0 && value.getSnapshot) {
    return value.getSnapshot();
  }

  return Object.entries(value).reduce((result, [key, value]) => {
    let snapshot = getSnapshot(value, level + 1);
    if (snapshot !== undefined) {
      result[key] = snapshot;
    }
    return result;
  }, {});
};

export default CodeStore;
export {MethodStore};