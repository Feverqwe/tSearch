const popsicle = require('popsicle');
import {StatusCodeError} from './errors';

const exKitRequest = (tracker, options) => {
  if (typeof options !== 'object' || !options.url) {
    throw new Error('Incorrect options');
  }

  const {origin} = new URL(options.url);

  if (!tracker.connectRe || !tracker.connectRe.test(origin)) {
    const err = new Error(`Connection is not allowed! ${origin} Add url patter in @connect!`);
    throw err;
  }

  const request = popsicle.request(options);
  tracker.requests.push(request);

  return request.then(function (response) {
    const is2xx = /^2/.test('' + response.status);
    if (!is2xx) {
      throw new StatusCodeError(response.self, response.body, null, response);
    }
    const result = {};
    ['url', 'headers', 'body', {key: 'status', value: 'statusCode'}, 'statusText'].forEach(function (key) {
      if (typeof key === 'string') {
        result[key] = response[key];
      } else {
        result[key.value] = response[key.key];
      }
    });
    return result;
  }).then(function (result) {
    tracker.requests.splice(tracker.requests.indexOf(request), 1);
    return result;
  }, function (err) {
    tracker.requests.splice(tracker.requests.indexOf(request), 1);
    throw err;
  });
};

export default exKitRequest;