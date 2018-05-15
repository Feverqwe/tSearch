const debug = require('debug')('frameWorker');
const qs = require('querystring');
import Transport from './transport';


class FrameWorker {
  constructor(query, actions) {
    this.query = query;
    this.actions = actions;
    this.frame = null;
    this.isLoaded = false;

    this.messageStack = [];

    this.frameListener = this.frameListener.bind(this);

    this.initTransport();

    this.init();
  }
  initTransport() {
    const self = this;

    this.transport = new Transport({
      onMessage(listener) {
        self.onMessage = listener;
      },
      postMessage(msg) {
        self.postMessage(msg);
      }
    }, this.actions);

    this.callFn = this.transport.callFn.bind(this.transport);
  }
  onMessage(msg) {
    debug('Message without listener', msg);
  }
  frameListener(e) {
    if (this.frame && e.source === this.frame.contentWindow) {
      this.onMessage(e.data);
    }
  }
  init() {
    this.destroyFrame();
    window.addEventListener("message", this.frameListener);
    const frame = this.frame = document.createElement('iframe');
    frame.src = 'sandbox.html' + '#' + qs.stringify(this.query);
    frame.style.display = 'none';
    frame.onload = () => {
      frame.onload = null;
      this.isLoaded = true;
      while (this.messageStack.length) {
        this.postMessage(this.messageStack.shift());
      }
    };
    document.body.appendChild(frame);
  }
  postMessage(msg) {
    if (!this.isLoaded) {
      this.messageStack.push(msg);
    } else {
      if (this.frame.contentWindow) {
        this.frame.contentWindow.postMessage(msg, '*');
      } else {
        throw new Error('Window is closed');
      }
    }
  }
  destroyFrame() {
    window.removeEventListener("message", this.frameListener);
    if (this.frame) {
      if (this.frame.parentNode) {
        this.frame.parentNode.removeChild(this.frame);
      }
    }
  }
  destroy() {
    this.destroyFrame();
    this.transport.destroy();
  }
}

export default FrameWorker;