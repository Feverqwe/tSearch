import ModuleWorker from "./moduleWorker";

class SectionWorker extends ModuleWorker {
  getItems() {
    return this.callFn('events.getItems');
  }
  sendCommand(command) {
    return this.callFn('events.command', [command]);
  }
}

export default SectionWorker;