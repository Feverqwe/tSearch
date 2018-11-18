import ModuleWorker from "./moduleWorker";
import {ErrorWithCode} from "./errors";

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
    }).then(postProcessResult);
  }
  sendCommand(command) {
    return this.init().then(() => {
      return this.callFn('events.command', [command]);
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