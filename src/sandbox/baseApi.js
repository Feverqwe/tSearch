import exKitRequestOptionsNormalize from "../tools/exKitRequestOptionsNormalize";
import exKitGetDoc from "../tools/exKitGetDoc";
import exKitNormalizeUrl from "../tools/exKitNormalizeUrl";

class BaseApi {
  constructor(api, transport) {
    this.api = api;
    this.transport = transport;

    this.public = {
      API_getDom: getDom,
      API_sanitizeHtml: noop,
      API_deSanitizeHtml: noop,
      API_normalizeUrl: exKitNormalizeUrl,
      API_getDoc: exKitGetDoc,
      API_event: this.event,
      API_getInfo: this.getInfo,
      API_request: this.request,
    };
  }

  event = (name, callback) => {
    this.api.events[name] = function (...args) {
      return Promise.resolve().then(function () {
        return callback(...args);
      });
    };
  };

  getInfo = () => {
    return this.api.info;
  };

  request = (rawOptions) => {
    const {options, toJson} = exKitRequestOptionsNormalize(rawOptions);

    return this.transport.callFn('request', [options]).then(response => {
      if (toJson) {
        response.body = JSON.parse(response.body);
      }

      return response;
    });
  };
}

/**
 * @deprecated
 */
const getDom = html => {
  return (new DOMParser()).parseFromString(html, 'text/html');
};

/**
 * @deprecated
 */
const noop = a => a;

export default BaseApi;