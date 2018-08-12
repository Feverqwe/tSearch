import getLogger from "./getLogger";
import once from 'lodash.once';
import deserializeError from 'deserialize-error';
import serializeError from 'serialize-error';

const debug = getLogger('frameWorker');

const emptyFn = () => {};

const promiseCallbackMap = new WeakMap();

class Transport {
  /**
   * @param {{onMessage:function(function),postMessage:function(*)}} transport
   * @param {Object} actions
   **/
  constructor(transport, actions) {
    this.transportId = Math.trunc(Math.random() * 1000);
    this.callbackIndex = 0;
    this.transport = transport;
    this.actions = actions;

    this.cbMap = new Map();

    this.onMessage = this.onMessage.bind(this);

    this.transport.onMessage(this.onMessage);
  }

  /**
   * @param {*} msg
   * @param {{event:Object}} options
   * @param {function(*)} response
   * @return {boolean}
   * @private
   */
  listener(msg, response) {
    switch (msg.action) {
      case 'callFn': {
        this.responseFn(msg, response);
        return true;
      }
    }
  }

  /**
   * @param {{responseId: string, message:*, callbackId: string}} msg
   */
  onMessage(msg) {
    const cbMap = this.cbMap;
    if (msg.responseId) {
      const callback = cbMap.get(msg.responseId);
      if (callback) {
        callback(msg.message);
      } else {
        debug('Callback is not found', msg);
      }
    } else {
      let response;
      if (msg.callbackId) {
        response = once(message => {
          this.transport.postMessage({
            responseId: msg.callbackId,
            message: message
          });
        });
      } else {
        response = emptyFn;
      }

      let result = null;
      try {
        result = this.listener(msg.message, response)
      } catch (err) {
        debug('Call listener error', err);
      }
      if (result !== true) {
        response();
      }
    }
  }

  /**
   * @param {*} message
   * @param {function} [callback]
   */
  sendMessage(message, callback) {
    const cbMap = this.cbMap;
    const msg = {
      message: message
    };

    if (callback) {
      msg.callbackId = this.transportId + '_' + (++this.callbackIndex);
      const wrappedCallback = message => {
        cbMap.delete(msg.callbackId);
        callback(message);
      };
      cbMap.set(msg.callbackId, wrappedCallback);
      if (promiseCallbackMap.has(callback)) {
        promiseCallbackMap.delete(callback);
        promiseCallbackMap.set(wrappedCallback, true);
      }
    }

    try {
      this.transport.postMessage(msg);
    } catch (err) {
      cbMap.delete(msg.callbackId);
      throw err;
    }
  }

  /**
   * @param {*} msg
   * @return {Promise}
   * @private
   */
  waitPromise(msg) {
    return new Promise((resolve, reject) => {
      const cb = response => {
        if (!response) {
          return reject(new Error('Response is empty'));
        } else
        if (response.err) {
          return reject(deserializeError(response.err));
        } else {
          return resolve(response.result);
        }
      };
      promiseCallbackMap.set(cb, true);
      this.sendMessage(msg, cb);
    });
  }

  /**
   * @param {string} fnName
   * @param {*[]} argsArray
   * @return {Promise}
   */
  callFn(fnName, argsArray = []) {
    const self = this;
    return self.waitPromise({
      action: 'callFn',
      fn: fnName,
      args: argsArray
    });
  }

  /**
   * @param {Promise} promise
   * @param {Function} response
   * @return {boolean}
   * @private
   */
  responsePromise(promise, response) {
    promise.then(result => {
      response({result: result});
    }, err => {
      response({err: serializeError(err)});
    }).catch(function (err) {
      debug('responsePromise error', err);
    });
    return true;
  }

  /**
   * @param {string} path
   * @return {{scope: Object, endPoint: *}}
   * @private
   */
  resolvePath(path) {
    const parts = path.split('.');
    const endPoint = parts.pop();
    let scope = this.actions;
    while (parts.length) {
      scope = scope[parts.shift()];
    }
    return {scope, endPoint};
  }

  /**
   * @param {{fn:string,args:*[]}} msg
   * @param {Function} response
   * @return {boolean}
   * @private
   */
  responseFn(msg, response) {
    const promise = Promise.resolve().then(() => {
      const {scope, endPoint: fn} = this.resolvePath(msg.fn);
      return scope[fn].apply(scope, msg.args);
    });
    return this.responsePromise(promise, response);
  }

  destroy() {
    this.cbMap.forEach(cb => {
      if (promiseCallbackMap.has(cb)) {
        cb({err: serializeError(new Error('Destroyed'))});
      } else {
        cb();
      }
    });
  }
}

export default Transport;