import {types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import CodeStore from "./CodeStore";
import getRandomColor from "../tools/getRandomColor";

const logger = getLogger('CodeMakerStore');

/**
 * @typedef {{}} CodeMakerStore
 * @property {CodeStore} [code]
 * @property {function} setCode
 */
const CodeMakerStore = types.model('CodeMakerStore', {
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
});

export default CodeMakerStore;