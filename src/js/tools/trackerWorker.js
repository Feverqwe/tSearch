import ModuleWorker from "./moduleWorker";

class TrackerWorker extends ModuleWorker {
  search(query) {
    return this.callFn('events.search', [{
      query: query
    }]);
  }
  searchNext(next) {
    return this.callFn('events.getNextPage', [next]);
  }
}

export default TrackerWorker;