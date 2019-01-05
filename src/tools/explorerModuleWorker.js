import ModuleWorker from "./moduleWorker";
import {ErrorWithCode} from "./errors";

class ExplorerModuleWorker extends ModuleWorker {
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
  getItems(params) {
    return this.init().then(() => {
      return this.callFn('events.getItems', [params]);
    }).then(postProcessResult);
  }
  sendCommand(command, params) {
    return this.init().then(() => {
      return this.callFn('events.command', [command, params]);
    }).then(postProcessResult);
  }
}

const postProcessResult = (result) => {
  if (!result) {
    throw new ErrorWithCode(`Result is empty`, 'EMPTY_RESULT');
  }
  if (!result.success) {
    throw new ErrorWithCode(`Result is not success`, 'NOT_SUCCESS');
  }
  return result;
};

export default ExplorerModuleWorker;