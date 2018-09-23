import getLogger from "../tools/getLogger";
import Transport from '../tools/transport';
import {Headers} from 'whatwg-fetch';
import './baseApi';

const qs = require('querystring');

const debug = getLogger('sandbox');

const altRequire = modules => {
  const promiseList = [];
  if (modules.indexOf('jquery') !== -1) {
    promiseList.push(import('jquery/dist/jquery.slim').then(jQuery => {
      window.$ = window.jQuery = jQuery.default;
    }));
  }
  if (modules.indexOf('sizzle') !== -1) {
    promiseList.push(import('sizzle').then(sizzle => {
      window.sizzle = sizzle.default;
    }));
  }
  if (modules.indexOf('moment') !== -1) {
    promiseList.push(import('moment').then(moment => {
      window.moment = moment.default;
    }));
  }
  if (modules.indexOf('exKit') !== -1) {
    promiseList.push(import('./exKit'));
  }
  if (modules.indexOf('datejs') !== -1) {
    promiseList.push(import('date.js').then(module => {
      window.datejs = module.default;
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
  options.method = options.method.toUpperCase();

  if (options.data) {
    if (options.method === 'POST') {
      options.body = options.data;
    } else {
      options.query = options.data;
    }
    delete options.data;
  }

  const headers = new Headers(options.headers);

  if (options.body) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    if (typeof options.body !== 'string') {
      if (/^application\/x-www-form-urlencoded/.test(headers.get('Content-Type'))) {
        options.body = qs.stringify(options.body);
      } else
      if (/^application\/json/.test(headers.get('Content-Type'))) {
        options.body = JSON.stringify(options.body);
      }
    }
  }

  if (options.query) {
    if (typeof options.query !== 'string') {
      options.query = qs.stringify(options.query);
    }
    options.url += (/\?/.test(options.url) ? '&' : '?') + options.query;

    delete options.query;
  }

  const toJson = options.json;
  delete options.json;

  options.headers = Array.from(headers.entries()).reduce((result, entry) => {
    result.push(entry);
    return result;
  }, []);

  return transport.callFn('request', [options]).then(response => {
    if (toJson) {
      response.body = JSON.parse(response.body);
    }

    return response;
  });
};