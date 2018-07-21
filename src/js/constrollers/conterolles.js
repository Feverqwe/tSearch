import History from "./history";

const controllers = {
  get history() {
    if (!this._history) {
      this._history = new History();
    }
    return this._history;
  }
};

export default controllers;