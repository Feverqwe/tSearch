import getLogger from "../tools/getLogger";
import Transport from '../tools/transport';

import './baseApi';

import 'script-loader!requirejs/require';

const debug = getLogger('sandbox');

const altRequire = modules => {
  const promiseList = [];
  if (modules.indexOf('jquery') !== -1) {
    promiseList.push(import('jquery').then(jQuery => {
      window.define('jquery', () => window.$ = window.jQuery = jQuery.default);
    }));
  }
  if (modules.indexOf('moment') !== -1) {
    promiseList.push(import('moment').then(moment => {
      window.define('moment', () => window.moment = moment.default);
    }));
  }
  if (modules.indexOf('exKit') -1) {
    promiseList.push(import('./exKit').then(module => {
      window.define('exKit', () => module.default);
    }));
  }
  return Promise.all(promiseList);
};

const runCode = code => {
  return eval(code);
};

const api = {
  info: null,
  init: function (code, requireList, info) {
    api.info = info;
    return altRequire(requireList).then(() => {
      return new Promise((resolve, reject) => window.require(requireList, resolve, reject));
    }).then(() => {
      return runCode(code);
    }).catch(err => {
      debug('Init error', err);
      throw err;
    });
  },
  events: {}
};

const transport = new Transport({
  postMessage: function (msg) {
    parent.postMessage(msg, '*');
  },
  onMessage: function (cb) {
    window.onmessage = function (e) {
      if (e.source === parent) {
        cb(e.data);
      }
    };
  }
}, api);

window.API_event = function (name, callback) {
  api.events[name] = function (query) {
    return Promise.resolve().then(function () {
      return callback(query);
    });
  };
};

window.API_getInfo = function () {
  return api.info;
};

window.API_request = function (options) {
  if (typeof options !== 'object') {
    options = {url: options};
  }

  if (options.type) {
    options.method = options.type;
    delete options.type;
  }

  if (!options.method) {
    options.method = 'GET';
  }

  if (options.data) {
    if (options.method === 'POST') {
      options.body = options.data;
    } else {
      options.query = options.data;
    }
    delete options.data;
  }

  if (!options.headers) {
    options.headers = {};
  }

  if (options.body && !options.headers['Content-Type']) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  if (options.cache === false && ['GET', 'HEAD'].indexOf(options.method) !== -1) {
    if (!options.query) {
      options.query = {};
    }
    options.query._ = Date.now();
  }

  const toJson = options.json;
  delete options.json;

  return transport.callFn('request', [options]).then(response => {
    if (toJson) {
      response.body = JSON.parse(response.body);
    }

    return response;
  });
};