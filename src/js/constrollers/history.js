const Events = require('events');

class History extends Events {
  constructor() {
    super();

    this.history = null;
  }
  getHistory() {
    if (!this.history) {
      return new Promise(resolve => chrome.storage.local.get({
        history: {}
      }, resolve)).then(({history}) => {
        this.history = history;
        this.emit('changed');

        chrome.storage.onChanged.addListener((changes, namespace) => {
          if (namespace === 'local') {
            const change = changes.history;
            if (change) {
              this.history = change.newValue;
              this.emit('changed');
            }
          }
        });

        return this.history;
      });
    } else {
      return Promise.resolve(this.history);
    }
  }
  getAll() {
    return this.getHistory().then(history => {
      return Array.from(Object.values(history));
    });
  }
}

const history = new History();

export default history;