import {types} from "mobx-state-tree";
import throttle from "lodash.throttle";

/**
 * @typedef {{}} PageStore
 * @property {number} [width]
 * @property {function} setWidth
 * @property {function} init
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */
const PageStore = types.model('PageStore', {
  width: types.optional(types.number, 0),
}).actions(self => {
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
    init() {
      onResize();
    },
    updateSize() {
      onResize();
    },
    afterCreate() {
      window.addEventListener('resize', onResizeThrottled);
    },
    beforeDestroy() {
      onResizeThrottled.cancel();
      window.removeEventListener('resize', onResizeThrottled);
    }
  };
});

export default PageStore;