import {Headers} from "whatwg-fetch";

const qs = require('querystring');

const exKitRequestOptionsNormalize = options => {
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

  return {options, toJson};
};

export default exKitRequestOptionsNormalize;