import FrameWorker from "./frameWorker";
import exKitRequest from "./exKitRequest";
import exKitBuildConnectRe from "./exKitBuildConnectRe";
import getLogger from "./getLogger";

const debug = getLogger('moduleWorker');

class ModuleWorker {
  constructor(module) {
    this.module = module;
    this.readyState = 'idle';
    this.worker = null;
    this.initPromise = null;

    this.requests = [];

    this.connectRe = exKitBuildConnectRe(module.meta.connect);

    const self = this;
    this.api = {
      request: (details) => {
        return exKitRequest(self, details);
      }
    };

    this.init();
  }
  init() {
    this.setReadyState('loading');
    const module = this.module;
    this.worker = new FrameWorker({
      moduleId: module.id
    }, this.api);
    const info = {
      locale: module.meta.locale
    };
    this.initPromise = this.worker.callFn('init', [module.code, module.meta.require, info]).catch(() => {
      return void 0;
    }, err => {
      debug('init error', module.id, err);
      throw new Error('InitWorkerError');
    });
    this.initPromise.then(() => {
      this.setReadyState('ready');
    }, err => {
      this.setReadyState('error');
      this.destroyWorker();
    });
  }
  setReadyState(value) {
    this.readyState = value;
  }
  callFn(event, args) {
    return this.initPromise.then(() => {
      if (!this.worker) {
        throw new Error('Worker is dead');
      }
      return this.worker.callFn(event, args);
    });
  }
  abortAllRequests() {
    this.requests.splice(0).forEach(req => {
      req.abort();
    });
  }
  destroyWorker() {
    if (this.worker) {
      this.worker.destroy();
      this.worker = null;
    }
  }
  destroy() {
    this.module = null;
    this.destroyWorker();
    this.abortAllRequests();
  }
}

export default ModuleWorker;