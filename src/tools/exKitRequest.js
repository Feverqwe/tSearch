import {StatusCodeError, ErrorWithCode} from './errors';
import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import getLogger from "./getLogger";

const contentType = require('content-type');

const logger = getLogger('exKitRequest');

/***
 * @typedef {{}} ExKitRequestOptions
 * @property {string} method
 * @property {string} url
 * @property {[string,string][]|{}<string,string>} headers
 * @property {string} charset
 * @property {string} body
 */

/**
 * @param tracker
 * @param {ExKitRequestOptions} options
 * @return {Promise}
 */
const exKitRequest = (tracker, options) => {
  if (typeof options !== 'object') {
    throw new ErrorWithCode('Options is not set', 'OPTIONS_IS_EMPTY');
  }

  const {url, charset, ...fetchOptions} = options;

  if (typeof url !== 'string') {
    throw new ErrorWithCode('Incorrect request, url is not string', 'INCORRECT_REQUEST');
  }

  const {origin} = new URL(url);
  if (!tracker.connectRe || !tracker.connectRe.test(origin)) {
    throw new ErrorWithCode(`Connection is not allowed! ${origin} Add url patter in @connect!`, 'ORIGIN_IS_NOT_AVAILABLE');
  }

  const controller = new AbortController();

  const request = fetch(url, {
    method: fetchOptions.method,
    headers: fetchOptions.headers,
    body: fetchOptions.body,
    signal: controller.signal
  });

  request.abort = () => {
    controller.abort();
  };

  tracker.requests.push(request);

  return request.then(response => {
    if (!response.ok) {
      throw new StatusCodeError(response.status, null, null, response);
    }

    return response.arrayBuffer().then(arrayBuffer => {
      return {response, arrayBuffer};
    });
  }).then(({response, arrayBuffer}) => {
    let responseCharset = null;
    if (response.headers.has('Content-Type')) {
      try {
        const obj = contentType.parse(response.headers.get('Content-Type'));
        responseCharset = obj.parameters.charset;
      } catch (err) {
        logger.warn('contentType.parse error', err);
      }
    }

    const decoder = new TextDecoder(charset || responseCharset || 'utf-8');
    const body = decoder.decode(arrayBuffer);

    return {
      url: response.url,
      statusCode: response.status,
      statusText: response.statusText,
      body,
      headers: Array.from(response.headers.entries()).reduce((result, [key, value]) => {
        result[key] = value;
        return result;
      }, {}),
    };
  }).then(result => {
    tracker.requests.splice(tracker.requests.indexOf(request), 1);
    return result;
  }, err => {
    tracker.requests.splice(tracker.requests.indexOf(request), 1);
    throw err;
  });
};

export default exKitRequest;