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
  search(query) {
    return this.init().then(() => {
      return this.callFn('events.search', [{
        query: query
      }])
    });
  }
  searchNext(next) {
    return this.init().then(() => {
      return this.callFn('events.getNextPage', [next]);
    });
  }
}

export default ExplorerModuleWorker;