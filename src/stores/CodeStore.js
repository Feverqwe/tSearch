import {types} from "mobx-state-tree";

const methods = {
  getAttr: {
    in: 'node',
    args: [{
      name: 'attribute',
      type: 'string',
    }],
    out: 'string'
  },
  getProp: {
    in: 'node',
    args: [{
      name: 'property',
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

  replace: {
    in: 'string',
    args: [{
      name: 'pattern',
      type: 'string',
    }, {
      name: 'replaceTo',
      type: 'string',
    }],
    out: 'string'
  },

  parseDate: {
    in: 'string',
    args: [{
      name: 'formats',
      multiple: true,
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
      name: 'template',
      values: [
        '2013-04-31[[[ 07]:03]:27]',
        '31-04-2013[[[ 07]:03]:27]',
        'n day ago',
        '04-31-2013[[[ 07]:03]:27]',
        '2d 1h 0m 0s ago'
      ],
    }],
    out: 'number'
  },
};

/**
 * @typedef {{}} MethodStore
 * @property {string} op
 * @property {*[]} args
 */
const MethodStore = types.model('ElementMethodStore', {
  op: types.string,
  args: types.array(types.frozen()),
});

/**
 * @typedef {{}} StringSelectorStore
 * @property {string} selector
 * @property {MethodStore[]} pipeline
 */
const StringSelectorStore = types.model('StringSelectorStore', {
  selector: types.string,
  pipeline: types.array(MethodStore),
});

/**
 * @typedef {{}} NumberSelectorStore
 * @property {string} selector
 * @property {MethodStore[]} pipeline
 */
const NumberSelectorStore = types.model('NumberSelectorStore', {
  selector: types.string,
  pipeline: types.array(MethodStore),
});

/**
 * @typedef {{}} ElementSelectorStore
 * @property {string} selector
 * @property {MethodStore[]} pipeline
 */
const ElementSelectorStore = types.model('ElementSelectorStore', {
  selector: types.string,
});

/**
 * @typedef {{}} CodeSearchStore
 * @property {string} url
 * @property {string} [method]
 * @property {string|undefined} baseUrl
 * @property {string|undefined} headers
 * @property {string|undefined} body
 * @property {string|undefined} encoding
 * @property {string|undefined} query
 * @property {string|undefined} charset
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
 * @property {string|undefined} url
 * @property {ElementSelectorStore|undefined} selector
 * @property {function} set
 */
const CodeAuthStore = types.model('CodeAuthStore', {
  url: types.maybe(types.string),
  selector: types.maybe(ElementSelectorStore),
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
 * @property {StringSelectorStore|undefined} categoryLink
 * @property {StringSelectorStore} title
 * @property {StringSelectorStore} link
 * @property {NumberSelectorStore|undefined} size
 * @property {StringSelectorStore|undefined} downloadLink
 * @property {NumberSelectorStore|undefined} seeds
 * @property {NumberSelectorStore|undefined} peers
 * @property {StringSelectorStore|undefined} date
 * @property {StringSelectorStore|undefined} nextPageLink
 * @property {function} set
 */
const CodeSelectorsStore = types.model('CodeSelectorsStore', {
  row: ElementSelectorStore,
  skipFromStart: types.optional(types.number, 0),
  skipFromEnd: types.optional(types.number, 0),
  isTableRow: types.optional(types.boolean, false),
  categoryTitle: types.maybe(StringSelectorStore),
  categoryLink: types.maybe(StringSelectorStore),
  title: StringSelectorStore,
  link: StringSelectorStore,
  size: types.maybe(NumberSelectorStore),
  downloadLink: types.maybe(StringSelectorStore),
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
});

/**
 * @typedef {{}} CodeDescriptionStore
 * @property {string} icon
 * @property {string} name
 * @property {string|undefined} description
 * @property {string|undefined} updateUrl
 * @property {string} version
 * @property {function} set
 */
const CodeDescriptionStore = types.model('CodeDescriptionStore', {
  icon: types.string,
  name: types.string,
  description: types.maybe(types.string),
  updateUrl: types.maybe(types.string),
  version: types.string,
}).actions(self => {
  return {
    set(key, value) {
      self[key] = value;
    },
  };
});

/**
 * @typedef {{}} CodeStore
 * @property {CodeSearchStore} search
 * @property {CodeAuthStore} [auth]
 * @property {CodeSelectorsStore} selectors
 * @property {CodeDescriptionStore} description
 */
const CodeStore = types.model('CodeStore', {
  search: CodeSearchStore,
  auth: types.optional(CodeAuthStore, {}),
  selectors: CodeSelectorsStore,
  description: CodeDescriptionStore,
});

export default CodeStore;