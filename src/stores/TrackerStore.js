import {types} from 'mobx-state-tree';
import TrackerWorker from "../tools/trackerWorker";
import getTrackerModule from "../tools/getTrackerModule";
import getLogger from "../tools/getLogger";

const logger = getLogger('TrackerStore');

/**
 * @typedef {{}} TrackerStore
 * @property {string} id
 * @property {number} [attached]
 * @property {string} [state]
 * @property {function} attach
 * @property {function} deattach
 * @property {function} handleAttachedChange
 * @property {function} createWorker
 * @property {function} destroyWorker
 * @property {function} beforeDestroy
 */
const TrackerStore = types.model('TrackerStore', {
  id: types.identifier,
  attached: types.optional(types.number, 0),
  state: types.optional(types.enumeration('State', ['idle', 'pending', 'done', 'error']), 'idle'),
}).actions(self => {
  return {
    attach() {
      self.attached++;
      self.handleAttachedChange();
    },
    deattach() {
      self.attached--;
      setTimeout(() => {
        self.handleAttachedChange();
      }, 1);
    },
    setState(state) {
      self.state = state;
    }
  };
}).views(self => {
  let worker = null;
  return {
    get meta() {
      return worker.module.meta || {};
    },
    getIconUrl() {
      if (self.meta.icon64) {
        return self.meta.icon64;
      } else if (self.meta.icon) {
        return self.meta.icon;
      }
      return '';
    },
    handleAttachedChange() {
      if (self.attached) {
        if (!worker) {
          self.createWorker();
        }
      } else {
        if (worker) {
          self.destroyWorker();
        }
      }
    },
    createWorker() {
      self.setState('pending');
      getTrackerModule(self.id).then(module => {
        worker = new TrackerWorker(module);
        return worker.init();
      }).then(() => {
        self.setState('done');
      }).catch(err => {
        logger.error('createWorker error', err);
        self.setState('error');
      });
    },
    destroyWorker() {
      worker.destroy();
      worker = null;
    },
    beforeDestroy() {
      if (worker) {
        self.destroyWorker();
      }
    }
  };
});

export default TrackerStore;