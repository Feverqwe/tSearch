import {types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import CodeStore from "./CodeStore";
import getRandomColor from "../tools/getRandomColor";

const logger = getLogger('CodeMakerStore');

/**
 * @typedef {{}} FrameStore
 * @property {string} [path]
 * @property {*} options
 * @property {boolean} [selectMode]
 * @property {string|undefined|null} selectOptions
 * @property {function} setPath
 * @property {function} setOptions
 * @property {function} setSelectMode
 * @property {function} setSelectOptions
 * @property {function} selectListener
 * @property {function} selectHandler
 * @property {function} setSelectListener
 * @property {function} setSelectHandler
 * @property {function} setSelect
 */
const FrameStore = types.model('FrameStore', {
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
  path: types.optional(types.string, ''),
  options: types.frozen(),
  selectMode: types.optional(types.boolean, false),
  selectOptions: types.frozen(),
}).actions(self => {
  return {
    setState(value) {
      self.state = value;
    },
    setPath(value) {
      self.path = value;
    },
    setOptions(options) {
      self.options = options;
    },
    setSelectMode(value) {
      self.selectMode = value;
    },
    setSelectOptions(value) {
      self.selectOptions = value;
    },
  };
}).views(self => {
  let selectListener = null;
  let selectHandler = null;
  return {
    getSelectListener() {
      return selectListener;
    },
    getSelectHandler() {
      return selectHandler;
    },
    selectListener(path) {
      self.setPath(path);
      if (selectListener) {
        selectListener(path);
      }
    },
    selectHandler(path) {
      self.setPath(path);
      if (selectHandler) {
        selectHandler(path);
      }
    },
    setSelectListener(listener) {
      selectListener = listener;
    },
    setSelectHandler(handler) {
      selectHandler = handler;
    },
    setSelect(selectMode = false, options = null, listener = null, handleSelect = null) {
      self.setSelectMode(selectMode);
      self.setSelectOptions(options);
      self.setSelectListener(listener);
      self.setSelectHandler(handleSelect);
    }
  };
});

/**
 * @typedef {{}} CodeMakerStore
 * @property {FrameStore} [frame]
 * @property {CodeStore} [code]
 * @property {function} setCode
 */
const CodeMakerStore = types.model('CodeMakerStore', {
  frame: types.optional(FrameStore, {}),
  code: types.optional(CodeStore, {
    search: {
      url: '',
    },
    selectors: {
      row: {selector: ''},
      title: {
        selector: '',
        pipeline: [{
          name: 'getText'
        }],
      },
      url: {
        selector: '',
        pipeline: [{
          name: 'getProp',
          args: ['href'],
        }],
      },
    },
    description: {
      icon: getRandomColor(),
      name: '',
      version: '1.0',
    }
  })
}).actions(self => {
  return {
    setCode(data) {
      const code = CodeStore.create(data);
      self.code = code;
    }
  };
}).views((self) => {
  return {
    get codeJson() {
      return JSON.stringify(self.code.getSnapshot());
    }
  };
});

export default CodeMakerStore;