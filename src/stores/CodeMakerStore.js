import {types} from 'mobx-state-tree';
import getLogger from "../tools/getLogger";
import CodeStore from "./CodeStore";
import getRandomColor from "../tools/getRandomColor";

const logger = getLogger('CodeMakerStore');

/**
 * @typedef {{}} CodeMakerStore
 * @property {CodeStore} [code]
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
      link: {
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
});

export default CodeMakerStore;