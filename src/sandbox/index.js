import getLogger from "../tools/getLogger";
import Transport from '../tools/transport';
import BaseApi from './baseApi';

const logger = getLogger('sandbox');

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
    promiseList.push(import('./exKit').then(module => {
      window.exKit = module.exKit;
      window.API_exKit = module.API_exKit;
    }));
  }
  if (modules.indexOf('datejs') !== -1) {
    promiseList.push(import('date.js').then(module => {
      window.datejs = module.default;
    }));
  }
  if (modules.indexOf('fecha') !== -1) {
    promiseList.push(import('fecha').then(module => {
      window.fecha = module.default;
    }));
  }
  if (modules.indexOf('filesizeParser') !== -1) {
    promiseList.push(import('filesize-parser').then(module => {
      window.filesizeParser = module.default;
    }));
  }
  return Promise.all(promiseList);
};

const runCode = code => {
  return Promise.resolve().then(() => {
    let promiseList = [];
    window.API_async = fn => {
      const promise = Promise.resolve().then(() => {
        return fn();
      });
      promiseList && promiseList.push(promise);
      return promise;
    };
    new Function(code)();
    const result = Promise.all(promiseList);
    promiseList = null;
    return result;
  }).then(() => {
    return null;
  }, err => {
    throw err;
  });
};

const api = {
  info: null,
  init: function (code, requireList, info) {
    api.info = info;
    return altRequire(requireList).then(() => {
      return runCode(code);
    }).catch(err => {
      logger.error('Init error', err);
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

const baseApi = new BaseApi(api, transport);

Object.assign(window, baseApi.public);