import throttle from 'lodash.throttle';
import {types} from "mobx-state-tree";
import getLogger from "../tools/getLogger";

const debug = getLogger('pageModel');

/**
 * @typedef {{}} PageM
 * Model:
 * @property {number} width
 * Actions:
 * @property {function(number)} setWidth
 * Views:
 */

const pageModel = types.model('pageModel', {
  id: types.optional(types.identifier(types.string), 'page'),
  width: types.optional(types.number, 0)
}).actions(/**PageM*/self => {
  return {
    setWidth(value) {
      self.width = value;
    }
  };
}).views(self => {
  const onResize = () => {
    self.setWidth(document.body.clientWidth);
  };
  const onResizeThrottled = throttle(onResize, 32);
  return {
    afterCreate() {
      onResize();
      window.addEventListener('resize', onResizeThrottled);
    },
    beforeDestroy() {
      window.removeEventListener('resize', onResizeThrottled);
    }
  };
}).create();

export default pageModel;