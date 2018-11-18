import {types} from "mobx-state-tree";
import getLogger from "../../tools/getLogger";

const logger = getLogger('ExplorerCommandStore');

/**
 * @typedef {{}} ExplorerCommandStore
 * @property {number} index
 * @property {string} [state]
 * @property {function} setState
 */
const ExplorerCommandStore = types.model('ExplorerCommandStore', {
  index: types.identifierNumber,
  state: types.optional(types.enumeration(['idle', 'pending', 'done', 'error']), 'idle'),
}).actions(self => {
  return {
    setState(value) {
      self.state = value;
    }
  };
});

export default ExplorerCommandStore;