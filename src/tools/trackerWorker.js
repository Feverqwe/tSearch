import ModuleWorker from "./moduleWorker";

class TrackerWorker extends ModuleWorker {
  constructor(...args) {
    super(...args);

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

export default TrackerWorker;