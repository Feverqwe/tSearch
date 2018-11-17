import ModuleWorker from "./moduleWorker";

class ExplorerModuleWorker extends ModuleWorker {
  constructor(module) {
    super(module);

    this.initPromise = null;
  }
  init() {
    if (this.initPromise) {
      return this.initPromise;
    }
    return this.initPromise = super.init();
  }
  getItems() {
    return this.init().then(() => {
      return this.callFn('events.getItems');
    });
  }
  sendCommand(command) {
    return this.init().then(() => {
      return this.callFn('events.command', [command]);
    });
  }
}

export default ExplorerModuleWorker;