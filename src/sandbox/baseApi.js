import exKitRequestOptionsNormalize from "../tools/exKitRequestOptionsNormalize";
import exKitGetDoc from "../tools/exKitGetDoc";
import exKitNormalizeUrl from "../tools/exKitNormalizeUrl";

class BaseApi {
  constructor(api, transport) {
    this.api = api;
    this.transport = transport;

    this.public = {
      API_getDom: getDom.bind(this),
      API_sanitizeHtml: sanitizeHtml.bind(this),
      API_deSanitizeHtml: sanitizeHtml.bind(this),
      API_normalizeUrl: exKitNormalizeUrl.bind(this),
      API_getDoc: exKitGetDoc.bind(this),
      API_event: this.event.bind(this),
      API_getInfo: this.getInfo.bind(this),
      API_request: this.request.bind(this),
    };
  }

  event(name, callback) {
    this.api.events[name] = function (query) {
      return Promise.resolve().then(function () {
        return callback(query);
      });
    };
  };

  getInfo() {
    return this.api.info;
  };

  request(rawOptions) {
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
const sanitizeHtml = a => a;

export default BaseApi;