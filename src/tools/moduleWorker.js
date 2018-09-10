import FrameWorker from "./frameWorker";
import exKitRequest from "./exKitRequest";
import exKitBuildConnectRe from "./exKitBuildConnectRe";
import getLogger from "./getLogger";

const logger = getLogger('moduleWorker');

class ModuleWorker {
  constructor(module) {
    this.module = module;

    this.worker = null;

    this.requests = [];

    this.connectRe = null;

    const self = this;
    this.api = {
      request: (details) => {
        return exKitRequest(self, details);
      }
    };
  }
  init() {
    const module = this.module;
    this.connectRe = exKitBuildConnectRe(module.meta.connect);
    this.worker = new FrameWorker({
      moduleId: module.id
    }, this.api);
    const info = {
      locale: module.meta.locale
    };
    return this.worker.callFn('init', [module.code, module.meta.require, info]).catch(err => {
      this.destroyWorker();
      throw err;
    });
  }
  callFn(event, args) {
    return this.worker.callFn(event, args);
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
    this.destroyWorker();
    this.abortAllRequests();
  }
}

export default ModuleWorker;