import {types} from "mobx-state-tree";

const methods = {
  getAttr: {
    in: 'node',
    args: [{
      name: 'Attribute',
      type: 'string',
    }],
    out: 'string'
  },
  getProp: {
    in: 'node',
    args: [{
      name: 'Property',
      type: 'string',
    }],
    out: 'string'
  },
  getText: {
    in: 'node',
    out: 'string'
  },
  getHtml: {
    in: 'node',
    out: 'string'
  },
  getChild: {
    in: 'node',
    args: [{
      name: 'Index',
      type: 'number',
    }],
    out: 'node'
  },

  trim: {
    in: 'string',
    out: 'string'
  },
  replace: {
    in: 'string',
    args: [{
      name: 'Pattern',
      type: 'string',
    }, {
      name: 'ReplaceTo',
      type: 'string',
    }],
    out: 'string'
  },

  parseDate: {
    in: 'string',
    multipleArgs: true,
    args: [{
      name: 'Format',
      type: 'string',
    }],
    out: 'number'
  },
  parseSize: {
    in: 'string',
    out: 'number'
  },
  toInt: {
    in: 'string',
    out: 'number'
  },
  toFloat: {
    in: 'string',
    out: 'number'
  },

  legacyReplaceToday: {
    in: 'string',
    out: 'string'
  },
  legacyReplaceMonth: {
    in: 'string',
    out: 'string'
  },
  legacyParseDate: {
    in: 'string',
    args: [{
      name: 'Template',
      type: 'select',
      values: [
        {key: 0, text: '2013-04-31[[[ 07]:03]:27]'},
        {key: 1, text: '31-04-2013[[[ 07]:03]:27]'},
        {key: 2, text: 'n day ago'},
        {key: 3, text: '04-31-2013[[[ 07]:03]:27]'},
        {key: 4, text: '2d 1h 0m 0s ago'},
      ],
    }],
    out: 'number'
  },
  legacySizeFormat: {
    in: 'string',
    out: 'number'
  }
};

/**
 * @typedef {{}} MethodStore
 * @property {string} name
 * @property {*[]} args
 * @property {function} setArgs
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
});

/**
 * @typedef {{}} StringSelectorStore
 * @property {string} selector
 * @property {MethodStore[]} pipeline
 * @property {function} set
 * @property {function} addMethod
 * @property {function} removeMethod
 * @property {function} moveMethod
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
    },
  };
});

/**
 * @typedef {StringSelectorStore} NumberSelectorStore
 * @property {string} selector
 * @property {MethodStore[]} pipeline
 */
const NumberSelectorStore = types.compose('NumberSelectorStore', StringSelectorStore, types.model({
  selector: types.string,
  pipeline: types.array(MethodStore),
}));

/**
 * @typedef {{}} ElementSelectorStore
 * @property {string} [selector]
 * @property {function} set
 */
const ElementSelectorStore = types.model('ElementSelectorStore', {
  selector: types.optional(types.string, ''),
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
 * @property {string} [headers]
 * @property {string} [body]
 * @property {string} [encoding]
 * @property {string} [query]
 * @property {string} [charset]
 * @property {function} set
 */
const CodeSearchStore = types.model('CodeSearchStore', {
  url: types.string,
  method: types.optional(types.enumeration(['GET', 'POST']), 'GET'),
  baseUrl: types.optional(types.string, ''),
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
});

/**
 * @typedef {{}} CodeAuthStore
 * @property {string} [url]
 * @property {ElementSelectorStore} [selector]
 * @property {function} set
 */
const CodeAuthStore = types.model('CodeAuthStore', {
  url: types.optional(types.string, ''),
  selector: types.optional(ElementSelectorStore, {}),
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
  };
});

/**
 * @typedef {{}} CodeSelectorsStore
 * @property {ElementSelectorStore} row
 * @property {number} [skipFromStart]
 * @property {number} [skipFromEnd]
 * @property {boolean} [isTableRow]
 * @property {StringSelectorStore|undefined} categoryTitle
 * @property {StringSelectorStore|undefined} categoryUrl
 * @property {StringSelectorStore|undefined} categoryId
 * @property {StringSelectorStore} title
 * @property {StringSelectorStore} url
 * @property {NumberSelectorStore|undefined} size
 * @property {StringSelectorStore|undefined} downloadUrl
 * @property {NumberSelectorStore|undefined} seeds
 * @property {NumberSelectorStore|undefined} peers
 * @property {StringSelectorStore|undefined} date
 * @property {StringSelectorStore|undefined} nextPageLink
 * @property {function} set
 * @property {function} getDefaultPipeline
 */
const CodeSelectorsStore = types.model('CodeSelectorsStore', {
  row: ElementSelectorStore,
  skipFromStart: types.optional(types.number, 0),
  skipFromEnd: types.optional(types.number, 0),
  isTableRow: types.optional(types.boolean, false),
  categoryTitle: types.maybe(StringSelectorStore),
  categoryUrl: types.maybe(StringSelectorStore),
  categoryId: types.maybe(StringSelectorStore),
  title: StringSelectorStore,
  url: StringSelectorStore,
  size: types.maybe(NumberSelectorStore),
  downloadUrl: types.maybe(StringSelectorStore),
  seeds: types.maybe(NumberSelectorStore),
  peers: types.maybe(NumberSelectorStore),
  date: types.maybe(StringSelectorStore),
  nextPageLink: types.maybe(StringSelectorStore),
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
      if (/Link$/.test(id)) {
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
    }
  };
});

/**
 * @typedef {{}} CodeDescriptionStore
 * @property {string} icon
 * @property {string} name
 * @property {string} [description]
 * @property {string} [downloadUrl]
 * @property {string} [version]
 * @property {function} set
 */
const CodeDescriptionStore = types.model('CodeDescriptionStore', {
  icon: types.string,
  name: types.string,
  description: types.optional(types.string, ''),
  downloadUrl: types.optional(types.string, ''),
  version: types.optional(types.string, '1.0'),
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
  };
});

/**
 * @typedef {{}} CodeStore
 * @property {string|undefined} id
 * @property {number} [version]
 * @property {CodeSearchStore} search
 * @property {CodeAuthStore} [auth]
 * @property {CodeSelectorsStore} selectors
 * @property {CodeDescriptionStore} description
 */
const CodeStore = types.model('CodeStore', {
  id: types.maybe(types.string),
  version: types.optional(types.refinement(types.number, value => value === 3), 3),
  search: CodeSearchStore,
  auth: types.optional(CodeAuthStore, {}),
  selectors: CodeSelectorsStore,
  description: CodeDescriptionStore,
});

export default CodeStore;
export {MethodStore, methods};